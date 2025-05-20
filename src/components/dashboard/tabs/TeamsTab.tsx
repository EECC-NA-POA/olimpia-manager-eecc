
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface TeamsTabProps {
  eventId: string | null;
  branchId?: string;
}

// Form validation schema
const teamFormSchema = z.object({
  nome: z.string().min(1, "Nome da equipe é obrigatório"),
  modalidade_id: z.string().min(1, "Modalidade é obrigatória"),
  cor_uniforme: z.string().optional(),
  observacoes: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export function TeamsTab({ eventId, branchId }: TeamsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<null | any>(null);
  
  // Form methods
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      nome: '',
      modalidade_id: '',
      cor_uniforme: '',
      observacoes: ''
    }
  });

  // Query to fetch team modalities (collective ones)
  const { data: teamModalities, isLoading: isLoadingModalities, error: modalitiesError } = useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo');
      
      if (error) {
        console.error('Error fetching team modalities:', error);
        throw new Error('Não foi possível carregar as modalidades coletivas');
      }
      
      return data;
    },
    enabled: !!eventId,
  });

  // Query to fetch teams
  const { data: teams, isLoading: isLoadingTeams, error: teamsError } = useQuery({
    queryKey: ['teams', eventId, branchId],
    queryFn: async () => {
      if (!eventId || !branchId) return [];
      
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          cor_uniforme,
          observacoes,
          modalidade_id,
          modalidades (
            nome,
            categoria
          )
        `)
        .eq('evento_id', eventId)
        .eq('filial_id', branchId);
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error('Não foi possível carregar as equipes');
      }
      
      return data;
    },
    enabled: !!eventId && !!branchId,
  });

  // Mutation to create/update team
  const teamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      if (editingTeam) {
        // Update existing team
        const { data, error } = await supabase
          .from('equipes')
          .update(teamData)
          .eq('id', editingTeam.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        // Create new team
        const { data, error } = await supabase
          .from('equipes')
          .insert([{ ...teamData, evento_id: eventId, filial_id: branchId }])
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success(editingTeam ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!');
      resetAndCloseDialog();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message || 'Não foi possível salvar a equipe'}`);
    }
  });

  // Mutation to delete a team
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success('Equipe excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir equipe: ${error.message}`);
    }
  });

  // Handle form submission
  const onSubmit = (data: TeamFormValues) => {
    teamMutation.mutate({
      nome: data.nome,
      modalidade_id: parseInt(data.modalidade_id),
      cor_uniforme: data.cor_uniforme,
      observacoes: data.observacoes,
    });
  };

  // Reset form and close dialog
  const resetAndCloseDialog = () => {
    form.reset();
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  // Handle edit team
  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    form.reset({
      nome: team.nome,
      modalidade_id: String(team.modalidade_id),
      cor_uniforme: team.cor_uniforme || '',
      observacoes: team.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  // Handle delete team
  const handleDeleteTeam = (teamId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  // Loading state
  if (isLoadingTeams || isLoadingModalities) {
    return <LoadingState />;
  }

  // Error state
  if (teamsError || modalitiesError) {
    return (
      <ErrorState 
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] })} 
      />
    );
  }

  // Empty state - No team modalities available
  if (!teamModalities || teamModalities.length === 0) {
    return (
      <EmptyState 
        title="Nenhuma modalidade coletiva disponível" 
        description="Não há modalidades coletivas disponíveis para este evento" 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-olimpics-green-primary">Gerenciamento de Equipes</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { 
                setEditingTeam(null);
                form.reset({
                  nome: '',
                  modalidade_id: '',
                  cor_uniforme: '',
                  observacoes: ''
                });
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Nova Equipe
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? 'Edite as informações da equipe abaixo.' 
                  : 'Preencha as informações abaixo para criar uma nova equipe.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Equipe</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da equipe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modalidade_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        disabled={!!editingTeam}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamModalities?.map((modality: any) => (
                            <SelectItem key={modality.id} value={String(modality.id)}>
                              {modality.nome} - {modality.categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cor_uniforme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do Uniforme</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Azul e Branco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input placeholder="Observações sobre a equipe (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetAndCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={teamMutation.isPending}>
                    {teamMutation.isPending ? 'Salvando...' : (editingTeam ? 'Atualizar' : 'Criar')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Teams List */}
      {teams && teams.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipes Cadastradas</CardTitle>
            <CardDescription>
              Gerencie as equipes para as modalidades coletivas do seu evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Uniforme</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team: any) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.nome}</TableCell>
                    <TableCell>{team.modalidades?.nome} - {team.modalidades?.categoria}</TableCell>
                    <TableCell>{team.cor_uniforme || '-'}</TableCell>
                    <TableCell>{team.observacoes || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState 
          title="Nenhuma equipe cadastrada" 
          description="Crie sua primeira equipe utilizando o botão 'Nova Equipe' acima."
        />
      )}
    </div>
  );
}
