
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface EventProfilesSectionProps {
  eventId: string | null;
}

interface ProfileType {
  id: string;
  codigo: string;
  descricao: string | null;
}

interface Profile {
  id: number;
  nome: string;
  descricao: string | null;
  evento_id: string;
  perfil_tipo_id: string;
  perfis_tipo: ProfileType;
  taxas_inscricao?: RegistrationFee[];
}

interface RegistrationFee {
  id: number;
  perfil_id: number;
  valor: number;
  isento: boolean;
  mostra_card: boolean;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  link_formulario: string | null;
}

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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EventProfilesSection({ eventId }: EventProfilesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
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
    },
  });

  // Fetch profile types
  const { data: profileTypes = [] } = useQuery({
    queryKey: ['profile-types'],
    queryFn: async () => {
      console.log('Fetching profile types...');
      const { data, error } = await supabase
        .from('perfis_tipo')
        .select('*')
        .order('descricao');

      if (error) {
        console.error('Error fetching profile types:', error);
        throw error;
      }
      console.log('Profile types fetched:', data);
      return data as ProfileType[];
    },
  });

  // Fetch profiles for the event
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['event-profiles', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.log('No eventId provided');
        return [];
      }

      console.log('Fetching profiles for event:', eventId);
      
      const { data, error } = await supabase
        .from('perfis')
        .select(`
          *,
          perfis_tipo (
            id,
            codigo,
            descricao
          ),
          taxas_inscricao (
            id,
            perfil_id,
            valor,
            isento,
            mostra_card,
            pix_key,
            data_limite_inscricao,
            contato_nome,
            contato_telefone,
            link_formulario
          )
        `)
        .eq('evento_id', eventId)
        .order('nome');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Profiles fetched:', data);
      console.log('Number of profiles found:', data?.length || 0);
      return data as Profile[];
    },
    enabled: !!eventId,
  });

  // Create/Update profile mutation
  const createUpdateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!eventId) throw new Error('Event ID is required');

      if (editingProfile) {
        // Update profile
        const { error: profileError } = await supabase
          .from('perfis')
          .update({
            nome: data.nome,
            descricao: data.descricao || null,
            perfil_tipo_id: data.perfil_tipo_id,
          })
          .eq('id', editingProfile.id);

        if (profileError) throw profileError;

        // Update registration fee
        const existingFee = editingProfile.taxas_inscricao?.[0];
        if (existingFee) {
          const { error: feeError } = await supabase
            .from('taxas_inscricao')
            .update({
              valor: data.valor,
              isento: data.isento,
              mostra_card: data.mostra_card,
              pix_key: data.pix_key || null,
              data_limite_inscricao: data.data_limite_inscricao || null,
              contato_nome: data.contato_nome || null,
              contato_telefone: data.contato_telefone || null,
              link_formulario: data.link_formulario || null,
            })
            .eq('id', existingFee.id);

          if (feeError) throw feeError;
        }
      } else {
        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('perfis')
          .insert({
            nome: data.nome,
            descricao: data.descricao || null,
            evento_id: eventId,
            perfil_tipo_id: data.perfil_tipo_id,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Create registration fee
        const { error: feeError } = await supabase
          .from('taxas_inscricao')
          .insert({
            perfil_id: newProfile.id,
            evento_id: eventId,
            valor: data.valor,
            isento: data.isento,
            mostra_card: data.mostra_card,
            pix_key: data.pix_key || null,
            data_limite_inscricao: data.data_limite_inscricao || null,
            contato_nome: data.contato_nome || null,
            contato_telefone: data.contato_telefone || null,
            link_formulario: data.link_formulario || null,
          });

        if (feeError) throw feeError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-profiles', eventId] });
      toast.success(editingProfile ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');
      setIsDialogOpen(false);
      setEditingProfile(null);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil: ' + error.message);
    },
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-profiles', eventId] });
      toast.success('Perfil excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting profile:', error);
      toast.error('Erro ao excluir perfil: ' + error.message);
    },
  });

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    const fee = profile.taxas_inscricao?.[0];
    
    form.reset({
      nome: profile.nome,
      descricao: profile.descricao || '',
      perfil_tipo_id: profile.perfil_tipo_id,
      valor: fee?.valor || 0,
      isento: fee?.isento || false,
      mostra_card: fee?.mostra_card || false,
      pix_key: fee?.pix_key || '',
      data_limite_inscricao: fee?.data_limite_inscricao || '',
      contato_nome: fee?.contato_nome || '',
      contato_telefone: fee?.contato_telefone || '',
      link_formulario: fee?.link_formulario || '',
    });
    
    setIsDialogOpen(true);
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ProfileFormValues) => {
    createUpdateProfileMutation.mutate(data);
  };

  if (!eventId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum evento selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('Rendering profiles section with profiles:', profiles);
  console.log('Is loading:', isLoading);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Perfis de Usuário e Taxas de Inscrição
              </CardTitle>
              <CardDescription>
                Configure os perfis disponíveis para este evento e suas respectivas taxas de inscrição
              </CardDescription>
            </div>
            <Button onClick={handleNewProfile} className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum perfil cadastrado para este evento.</p>
              <Button onClick={handleNewProfile} className="mt-4 bg-olimpics-green-primary hover:bg-olimpics-green-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Perfil
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const fee = profile.taxas_inscricao?.[0];
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {profile.perfis_tipo.descricao || profile.perfis_tipo.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {profile.descricao || '-'}
                      </TableCell>
                      <TableCell>
                        {fee?.isento ? (
                          <Badge variant="secondary">Isento</Badge>
                        ) : (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            R$ {fee?.valor?.toFixed(2) || '0,00'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fee?.mostra_card ? (
                          <Badge variant="default">Visível</Badge>
                        ) : (
                          <Badge variant="secondary">Oculto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProfileMutation.mutate(profile.id)}
                            disabled={deleteProfileMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createUpdateProfileMutation.isPending}
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
                >
                  {createUpdateProfileMutation.isPending
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
    </div>
  );
}
