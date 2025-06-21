
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface CreateEventDialogActionsProps {
  onClose: () => void;
  isLoading: boolean;
}

export function CreateEventDialogActions({ onClose, isLoading }: CreateEventDialogActionsProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
      </Button>
    </DialogFooter>
  );
}
