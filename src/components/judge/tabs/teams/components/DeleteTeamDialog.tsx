
import React from 'react';
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
import { Trash2, Users } from 'lucide-react';
import { TeamData } from '../types';

interface DeleteTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamData | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteTeamDialog({
  isOpen,
  onOpenChange,
  team,
  onConfirm,
  isDeleting
}: DeleteTeamDialogProps) {
  if (!team) return null;

  const athleteCount = team.atletas.length;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Confirmar Exclusão da Equipe
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem certeza que deseja excluir a equipe <strong>"{team.nome}"</strong>?
            </p>
            
            {athleteCount > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">
                    Atletas Afetados
                  </span>
                </div>
                <p className="text-sm">
                  Esta ação irá remover <strong>{athleteCount} atleta{athleteCount > 1 ? 's' : ''}</strong> da equipe:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  {team.atletas.map((athlete) => (
                    <li key={athlete.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      {athlete.atleta_nome}
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-2 text-muted-foreground">
                  Os atletas ficarão disponíveis para serem adicionados a outras equipes.
                </p>
              </div>
            )}
            
            <p className="text-sm font-medium">
              Esta ação não pode ser desfeita.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Equipe'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
