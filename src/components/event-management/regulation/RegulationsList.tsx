
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EventRegulation } from '@/lib/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ExternalLink, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/components/EmptyState';
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
import { format } from 'date-fns';

interface RegulationsListProps {
  regulations: EventRegulation[];
  onEdit: (regulation: EventRegulation) => void;
  onRefresh: () => void;
}

export function RegulationsList({ regulations, onEdit, onRefresh }: RegulationsListProps) {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [regulationToDelete, setRegulationToDelete] = React.useState<EventRegulation | null>(null);
  
  const handleDeleteClick = (regulation: EventRegulation) => {
    setRegulationToDelete(regulation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!regulationToDelete) return;
    
    try {
      const { error } = await supabase
        .from('eventos_regulamentos')
        .delete()
        .eq('id', regulationToDelete.id);
      
      if (error) throw error;
      
      toast.success('Regulamento excluído com sucesso');
      onRefresh();
    } catch (error) {
      console.error('Error deleting regulation:', error);
      toast.error('Erro ao excluir regulamento');
    } finally {
      setDeleteDialogOpen(false);
      setRegulationToDelete(null);
    }
  };

  const handleToggleStatus = async (regulation: EventRegulation) => {
    try {
      const { error } = await supabase
        .from('eventos_regulamentos')
        .update({ 
          is_ativo: !regulation.is_ativo,
          atualizado_por: user?.id,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', regulation.id);
      
      if (error) throw error;
      
      toast.success(`Regulamento ${regulation.is_ativo ? 'desativado' : 'ativado'} com sucesso`);
      onRefresh();
    } catch (error) {
      console.error('Error updating regulation status:', error);
      toast.error('Erro ao atualizar status do regulamento');
    }
  };

  if (regulations.length === 0) {
    return (
      <EmptyState
        title="Nenhum regulamento cadastrado"
        description="Adicione o primeiro regulamento para este evento."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Versão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regulations.map((regulation) => (
            <TableRow key={regulation.id}>
              <TableCell className="font-medium">{regulation.titulo}</TableCell>
              <TableCell>{regulation.versao}</TableCell>
              <TableCell>
                <Badge variant={regulation.is_ativo ? "success" : "secondary"}>
                  {regulation.is_ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(regulation.criado_em), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                {regulation.atualizado_em 
                  ? format(new Date(regulation.atualizado_em), 'dd/MM/yyyy')
                  : '-'
                }
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(regulation)} 
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(regulation)}
                    title={regulation.is_ativo ? "Desativar" : "Ativar"}
                  >
                    {regulation.is_ativo ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  {regulation.regulamento_link && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Abrir link"
                    >
                      <a href={regulation.regulamento_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteClick(regulation)}
                    title="Excluir"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Regulamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este regulamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
