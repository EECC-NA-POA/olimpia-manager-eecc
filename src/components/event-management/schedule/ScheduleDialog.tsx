
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleForm } from './ScheduleForm';
import { ScheduleForm as ScheduleFormType } from './types';

interface ScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentItem: ScheduleFormType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string | number | boolean) => void;
  handleDiaToggle: (dia: string, checked: boolean) => void;
  handleHorarioChange: (dia: string, tipo: 'inicio' | 'fim', valor: string) => void;
  handleDataFimRecorrenciaChange: (data: string) => void;
  handleSave: () => void;
  isSaving: boolean;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  currentItem,
  handleInputChange,
  handleSelectChange,
  handleDiaToggle,
  handleHorarioChange,
  handleDataFimRecorrenciaChange,
  handleSave,
  isSaving
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <ScheduleForm 
          currentItem={currentItem}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleDiaToggle={handleDiaToggle}
          handleHorarioChange={handleHorarioChange}
          handleDataFimRecorrenciaChange={handleDataFimRecorrenciaChange}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
