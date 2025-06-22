
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
import { Athlete } from '../../hooks/useAthletes';

interface AthleteScoreDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  athlete: Athlete | null;
  modalityName?: string;
  bateriaId?: number | null;
  isDeleting: boolean;
}

export function AthleteScoreDeletionDialog({
  isOpen,
  onClose,
  onConfirm,
  athlete,
  modalityName,
  bateriaId,
  isDeleting
}: AthleteScoreDeletionDialogProps) {
  const getBateriaText = () => {
    if (!bateriaId) return '';
    if (bateriaId === 999) return ' da bateria Final';
    return ` da bateria ${bateriaId}`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar remoção de pontuações</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você tem certeza que deseja remover <strong>todas as pontuações</strong> do atleta{' '}
              <strong>{athlete?.atleta_nome}</strong> na modalidade{' '}
              <strong>{modalityName}</strong>{getBateriaText()}?
            </p>
            <p className="text-red-600 font-medium">
              Esta ação não pode ser desfeita!
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
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Removendo...' : 'Sim, remover pontuações'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
