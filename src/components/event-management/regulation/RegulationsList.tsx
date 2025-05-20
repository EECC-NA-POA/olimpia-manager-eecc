
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Toggle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { EventRegulation } from '@/lib/types/database';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/dashboard/components/EmptyState';
import { LoadingState } from '@/components/dashboard/components/LoadingState';

interface RegulationsListProps {
  eventId: string;
  onEdit: (regulation: EventRegulation) => void;
}

export function RegulationsList({ eventId, onEdit }: RegulationsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regulationToDelete, setRegulationToDelete] = useState<string | null>(null);

  const { data: regulations, isLoading, refetch } = useQuery({
    queryKey: ['regulations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_regulamentos')
        .select('*')
        .eq('evento_id', eventId)
        .order('criado_em', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar regulamentos');
        throw error;
      }

      return data as EventRegulation[];
    },
  });

  const handleDelete = async () => {
    if (!regulationToDelete) return;

    const { error } = await supabase
      .from('eventos_regulamentos')
      .delete()
      .eq('id', regulationToDelete);

    if (error) {
      toast.error('Erro ao excluir regulamento');
      return;
    }

    toast.success('Regulamento excluído com sucesso');
    refetch();
    setDeleteDialogOpen(false);
    setRegulationToDelete(null);
  };

  const handleToggleStatus = async (regulation: EventRegulation) => {
    const { error } = await supabase
      .from('eventos_regulamentos')
      .update({ is_ativo: !regulation.is_ativo })
      .eq('id', regulation.id);

    if (error) {
      toast.error('Erro ao atualizar status do regulamento');
      return;
    }

    toast.success(
      `Regulamento ${regulation.is_ativo ? 'desativado' : 'ativado'} com sucesso`
    );
    refetch();
  };

  if (isLoading) return <LoadingState />;

  if (!regulations || regulations.length === 0) {
    return (
      <EmptyState 
        title="Nenhum regulamento cadastrado" 
        description="Adicione um novo regulamento para o evento." 
        action={<Button variant="outline" onClick={() => onEdit({ id: '', evento_id: eventId, versao: '1.0', titulo: '', regulamento_texto: '', regulamento_link: null, is_ativo: true, criado_por: '', criado_em: '', atualizado_por: null, atualizado_em: null })}>Adicionar Regulamento</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {regulations.map((regulation) => (
        <Card key={regulation.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{regulation.titulo}</h3>
                  <div className="text-sm text-muted-foreground">
                    Versão: {regulation.versao}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={regulation.is_ativo ? 'success' : 'warning'}>
                    {regulation.is_ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(regulation)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRegulationToDelete(regulation.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Button
                  variant={regulation.is_ativo ? 'warning' : 'success'}
                  size="sm"
                  onClick={() => handleToggleStatus(regulation)}
                >
                  <Toggle className="h-4 w-4 mr-2" />
                  {regulation.is_ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este regulamento? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
