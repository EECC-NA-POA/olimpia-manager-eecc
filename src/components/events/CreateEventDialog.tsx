
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useBranchData } from '@/hooks/dashboard/useBranchData';
import { CreateEventForm } from './components/CreateEventForm';
import { CreateEventDialogActions } from './components/CreateEventDialogActions';
import { useCreateEvent } from './hooks/useCreateEvent';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const { branches } = useBranchData();
  const { isLoading } = useCreateEvent({ 
    onEventCreated, 
    onClose: () => onOpenChange(false) 
  });

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

        <CreateEventDialogActions 
          onClose={handleClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
