
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { DEBUG_MODE } from '@/constants/routes';

interface EventSelectionHeaderProps {
  onLogout: () => Promise<void>;
}

export function EventSelectionHeader({ onLogout }: EventSelectionHeaderProps) {
  const { canCreateEvents, isLoading: permissionLoading } = useCanCreateEvents();
  const [createEventDialogOpen, setCreateEventDialogOpen] = React.useState(false);
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-center bg-olimpics-green-primary text-white py-2 px-4 rounded-lg inline-block">
        Selecione um Evento
      </h1>
      
      <div className="flex gap-2">
        {/* Mostrar o botão independentemente do estado de carregamento durante o desenvolvimento */}
        {(!permissionLoading && canCreateEvents) || (DEBUG_MODE && !permissionLoading) ? (
          <Button 
            onClick={() => setCreateEventDialogOpen(true)}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        ) : null}
        
        <Button
          onClick={onLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
      
      {createEventDialogOpen && (
        <EventCreationDialogContainer 
          open={createEventDialogOpen}
          onOpenChange={setCreateEventDialogOpen}
        />
      )}
    </div>
  );
}

function EventCreationDialogContainer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { refetch } = useUserAgeQuery(); // Reuse the same query from the content component
  
  const handleEventCreated = () => {
    refetch();
    toast.success("Evento criado com sucesso!");
  };
  
  return (
    <CreateEventDialog 
      open={open}
      onOpenChange={onOpenChange}
      onEventCreated={handleEventCreated}
    />
  );
}

// Import these at the top to avoid the linter errors
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { useUserAgeQuery } from './hooks/useUserAgeQuery';
import { toast } from "sonner";
