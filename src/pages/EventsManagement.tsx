
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

// Form schema for event creation
const eventSchema = z.object({
  nome: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição do evento deve ter pelo menos 10 caracteres'),
  tipo: z.enum(['estadual', 'nacional', 'internacional', 'regional']),
  data_inicio_inscricao: z.date({
    required_error: 'Data de início das inscrições é obrigatória',
  }),
  data_fim_inscricao: z.date({
    required_error: 'Data de fim das inscrições é obrigatória',
  }),
  status_evento: z.enum(['ativo', 'encerrado', 'suspenso']),
  visibilidade_publica: z.boolean().default(true),
  foto_evento: z.string().optional(),
}).refine(data => data.data_fim_inscricao >= data.data_inicio_inscricao, {
  message: 'A data de fim das inscrições deve ser posterior à data de início',
  path: ['data_fim_inscricao'],
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventsManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Setup form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'estadual',
      status_evento: 'ativo',
      visibilidade_publica: true,
    },
  });

  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        navigate('/');
        toast.error('Você precisa estar logado para acessar esta página');
        return;
      }

      try {
        // Check if user has admin role
        const { data: userRoles, error } = await supabase
          .from('papeis_usuarios')
          .select(`
            perfil_id,
            perfis!inner(
              perfil_tipo_id,
              perfis_tipo!inner(
                codigo
              )
            )
          `)
          .eq('usuario_id', user.id);

        if (error) throw error;

        // Check if any of the user's roles has the type code "ADM"
        const hasAdminRole = userRoles?.some(
          role => role.perfis?.perfis_tipo?.codigo === 'ADM'
        );

        if (!hasAdminRole) {
          toast.error('Acesso restrito a administradores');
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin role:', error);
        toast.error('Erro ao verificar permissões de acesso');
        navigate('/');
      }
    };

    checkAdminRole();
  }, [user, navigate]);

  const onSubmit = async (data: EventFormValues) => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      // Format dates to ISO strings
      const eventData = {
        ...data,
        data_inicio_inscricao: data.data_inicio_inscricao.toISOString().split('T')[0],
        data_fim_inscricao: data.data_fim_inscricao.toISOString().split('T')[0],
      };

      const { error, data: newEvent } = await supabase
        .from('eventos')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Evento "${data.nome}" cadastrado com sucesso!`);
      form.reset();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(`Erro ao cadastrar evento: ${error.message || 'Tente novamente mais tarde'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
          Cadastro de Eventos
        </h1>
      </div>

      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <CardTitle className="text-olimpics-green-primary text-xl">
            Novo Evento
          </CardTitle>
          <CardDescription className="mt-1.5">
            Preencha as informações abaixo para cadastrar um novo evento.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Evento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do evento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Evento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="estadual">Estadual</SelectItem>
                          <SelectItem value="nacional">Nacional</SelectItem>
                          <SelectItem value="internacional">Internacional</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva o evento"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="data_inicio_inscricao"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de início das inscrições</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full pl-3 text-left font-normal"
                              }
                            >
                              {field.value ? (
                                format(field.value, "P")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_fim_inscricao"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de fim das inscrições</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full pl-3 text-left font-normal"
                              }
                            >
                              {field.value ? (
                                format(field.value, "P")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status_evento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Evento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="encerrado">Encerrado</SelectItem>
                          <SelectItem value="suspenso">Suspenso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foto_evento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto do Evento (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="URL da imagem" />
                      </FormControl>
                      <FormDescription>
                        Adicione uma URL para a imagem do evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
