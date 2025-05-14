
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { PerfilTipo } from "@/lib/types/database";
import { EventCarousel } from "./event-selection/EventCarousel";
import { useEventQuery } from "./event-selection/useEventQuery";
import { useEventRegistration } from "./event-selection/useEventRegistration";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
  isUnderAge?: boolean;
}

export const EventSelection = ({ 
  selectedEvents, 
  onEventSelect, 
  mode,
  isUnderAge = false
}: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedRole, setSelectedRole] = useState<PerfilTipo>('ATL');
  
  const { data: events, isLoading } = useEventQuery(user?.id);
  const registerEventMutation = useEventRegistration(user?.id);

  const handleEventRegistration = async (eventId: string) => {
    try {
      const result = await registerEventMutation.mutateAsync({ 
        eventId, 
        selectedRole 
      });

      // Store the current event ID
      console.log('Setting current event ID in localStorage:', eventId);
      localStorage.setItem('currentEventId', eventId);

      // Show appropriate message before redirecting
      if (result.isExisting) {
        toast.success('Bem-vindo de volta ao evento!');
      } else {
        toast.success('Inscrição realizada com sucesso!');
      }
      
      // Redirect after a short delay to ensure toast is seen and localStorage is updated
      setTimeout(() => {
        navigate('/athlete-profile');
      }, 300);
    } catch (error) {
      console.error('Error in handleEventRegistration:', error);
      toast.error('Erro ao processar inscrição. Tente novamente.');
    }
  };

  const handleEventSelect = (eventId: string, isRegistered: boolean) => {
    console.log('Event selected, setting in localStorage:', eventId);
    localStorage.setItem('currentEventId', eventId);
    
    if (isRegistered) {
      toast.success('Evento selecionado com sucesso!');
      // Short delay to ensure toast is visible
      setTimeout(() => {
        navigate('/athlete-profile');
      }, 300);
    }
  };

  const handleExit = async () => {
    try {
      await signOut();
      localStorage.removeItem('currentEventId');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center text-gray-500">
          {mode === 'registration' 
            ? 'Não há eventos com inscrições abertas no momento.'
            : 'Você ainda não está inscrito em nenhum evento.'}
        </div>
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventCarousel
        events={events}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onEventAction={(eventId) => {
          const event = events.find(e => e.id === eventId);
          if (event?.isRegistered) {
            handleEventSelect(eventId, true);
          } else {
            handleEventRegistration(eventId);
          }
        }}
        isUnderAge={isUnderAge}
      />
      <div className="flex justify-center">
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
