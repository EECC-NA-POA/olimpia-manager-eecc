
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useBranchData } from '@/hooks/dashboard/useBranchData';
import { CreateEventForm } from './components/CreateEventForm';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const { branches } = useBranchData();

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo evento.
          </DialogDescription>
        </DialogHeader>

        <CreateEventForm 
          branches={branches || []} 
          onEventCreated={onEventCreated}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
