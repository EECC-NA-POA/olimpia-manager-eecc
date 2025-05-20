
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { DEBUG_MODE } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { useUserAgeQuery } from './hooks/useUserAgeQuery';

interface EventSelectionHeaderProps {
  onLogout: () => Promise<void>;
}

export function EventSelectionHeader({ onLogout }: EventSelectionHeaderProps) {
  const { canCreateEvents, isLoading: permissionLoading } = useCanCreateEvents();
  const [createEventDialogOpen, setCreateEventDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('EventSelectionHeader - Initiating logout process...');
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('EventSelectionHeader - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };
  
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
          onClick={handleLogout}
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
