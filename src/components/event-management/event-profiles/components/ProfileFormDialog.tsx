
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProfileType, Profile } from '../types';
import { ProfileFormValues } from '../hooks/useProfileMutations';

const profileFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  perfil_tipo_id: z.string().min(1, 'Tipo de perfil é obrigatório'),
  valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  isento: z.boolean().default(false),
  mostra_card: z.boolean().default(false),
  pix_key: z.string().optional(),
  data_limite_inscricao: z.string().optional(),
  contato_nome: z.string().optional(),
  contato_telefone: z.string().optional(),
  link_formulario: z.string().optional(),
});

interface ProfileFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile: Profile | null;
  profileTypes: ProfileType[];
  onSubmit: (data: ProfileFormValues) => void;
  isSubmitting: boolean;
}

export function ProfileFormDialog({ 
  isOpen, 
  onClose, 
  editingProfile, 
  profileTypes, 
  onSubmit, 
  isSubmitting 
}: ProfileFormDialogProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: editingProfile?.nome || '',
      descricao: editingProfile?.descricao || '',
      perfil_tipo_id: editingProfile?.perfil_tipo_id || '',
      valor: editingProfile?.taxas_inscricao?.[0]?.valor || 0,
      isento: editingProfile?.taxas_inscricao?.[0]?.isento || false,
      mostra_card: editingProfile?.taxas_inscricao?.[0]?.mostra_card || false,
      pix_key: editingProfile?.taxas_inscricao?.[0]?.pix_key || '',
      data_limite_inscricao: editingProfile?.taxas_inscricao?.[0]?.data_limite_inscricao || '',
      contato_nome: editingProfile?.taxas_inscricao?.[0]?.contato_nome || '',
      contato_telefone: editingProfile?.taxas_inscricao?.[0]?.contato_telefone || '',
      link_formulario: editingProfile?.taxas_inscricao?.[0]?.link_formulario || '',
    },
  });

  React.useEffect(() => {
    if (editingProfile) {
      const fee = editingProfile.taxas_inscricao?.[0];
      form.reset({
        nome: editingProfile.nome,
        descricao: editingProfile.descricao || '',
        perfil_tipo_id: editingProfile.perfil_tipo_id,
        valor: fee?.valor || 0,
        isento: fee?.isento || false,
        mostra_card: fee?.mostra_card || false,
        pix_key: fee?.pix_key || '',
        data_limite_inscricao: fee?.data_limite_inscricao || '',
        contato_nome: fee?.contato_nome || '',
        contato_telefone: fee?.contato_telefone || '',
        link_formulario: fee?.link_formulario || '',
      });
    } else {
      form.reset({
        nome: '',
        descricao: '',
        perfil_tipo_id: '',
        valor: 0,
        isento: false,
        mostra_card: false,
        pix_key: '',
        data_limite_inscricao: '',
        contato_nome: '',
        contato_telefone: '',
        link_formulario: '',
      });
    }
  }, [editingProfile, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
          </DialogTitle>
          <DialogDescription>
            Configure o perfil de usuário e sua taxa de inscrição para este evento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Perfil</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atleta, Público Geral..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perfil_tipo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Perfil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profileTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.descricao || type.codigo}
                          </SelectItem>
                        ))}
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
                      placeholder="Descrição opcional do perfil..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuração de Taxa
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Taxa (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isento"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Isento</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Perfil sem cobrança de taxa
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mostra_card"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Mostrar Card</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Exibir na seleção de perfis
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pix_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input placeholder="Chave PIX para pagamento..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_limite_inscricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Limite</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contato_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome para contato..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contato_telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="link_formulario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Formulário</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
              >
                {isSubmitting
                  ? 'Salvando...'
                  : editingProfile
                  ? 'Atualizar'
                  : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
