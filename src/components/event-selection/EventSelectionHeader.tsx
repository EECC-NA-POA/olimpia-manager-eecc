
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { DEBUG_MODE } from '@/constants/routes';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { useUserAgeQuery } from './hooks/useUserAgeQuery';
import { toast } from 'sonner';

interface EventSelectionHeaderProps {
  onLogout: () => Promise<void>;
}

export function EventSelectionHeader({ onLogout }: EventSelectionHeaderProps) {
  const { canCreateEvents, isLoading: permissionLoading } = useCanCreateEvents();
  const [createEventDialogOpen, setCreateEventDialogOpen] = React.useState(false);
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left bg-olimpics-green-primary text-white py-2 px-4 rounded-lg">
        Selecione um Evento
      </h1>
      
      <div className="flex justify-center sm:justify-end">
        {/* Mostrar o botão independentemente do estado de carregamento durante o desenvolvimento */}
        {(!permissionLoading && canCreateEvents) || (DEBUG_MODE && !permissionLoading) ? (
          <Button 
            onClick={() => setCreateEventDialogOpen(true)}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm">Criar Evento</span>
          </Button>
        ) : null}
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
  const { refetch } = useUserAgeQuery();
  
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
