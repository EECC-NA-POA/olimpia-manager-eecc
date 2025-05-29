import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { PerfilTipo } from "@/lib/types/database";
import { EventCarousel } from "./event-selection/EventCarousel";
import { useEventQuery } from "./event-selection/useEventQuery";
import { useEventRegistration } from "./event-selection/useEventRegistration";
import { toast } from "sonner";
import { usePrivacyPolicyCheck } from "@/hooks/usePrivacyPolicyCheck";
import { PrivacyPolicyAcceptanceModal } from "./PrivacyPolicyAcceptanceModal";

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
  const { user, signOut, setCurrentEventId } = useAuth();
  const [selectedRole, setSelectedRole] = useState<PerfilTipo>('ATL');
  
  // Check if the user needs to accept the privacy policy
  const { 
    needsAcceptance, 
    checkCompleted,
    refetchCheck 
  } = usePrivacyPolicyCheck();

  // Only fetch events if privacy policy check is complete and accepted
  const shouldFetchEvents = checkCompleted && !needsAcceptance;
  
  const { data: events, isLoading } = useEventQuery(user?.id, shouldFetchEvents);
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
      setCurrentEventId(eventId); // Add this line to update context state

      // Show appropriate message before redirecting
      if (result.isExisting) {
        toast("Bem-vindo de volta ao evento!");
      } else {
        toast("Inscrição realizada com sucesso!");
      }
      
      // Redirect after a short delay to ensure toast is seen and localStorage is updated
      setTimeout(() => {
        navigate('/athlete-profile');
      }, 300);
    } catch (error) {
      console.error('Error in handleEventRegistration:', error);
      toast.error("Erro ao processar inscrição. Tente novamente.");
    }
  };

  const handleEventAction = (eventId: string, isRegistered: boolean) => {
    console.log('Event action called with:', { eventId, isRegistered });
    
    if (isRegistered) {
      // If already registered, update both localStorage and context state
      console.log('User is already registered, setting event in context and localStorage:', eventId);
      localStorage.setItem('currentEventId', eventId);
      setCurrentEventId(eventId); // Update context state
      toast("Evento selecionado com sucesso!");
      
      // Short delay to ensure toast is visible
      setTimeout(() => {
        navigate('/athlete-profile');
      }, 300);
    } else {
      // If not registered, proceed with registration
      handleEventRegistration(eventId);
    }
  };

  const handleExit = async () => {
    try {
      console.log('EventSelection - Initiating logout process...');
      
      // Clear event data first
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      
      // Sign out from auth
      await signOut();
      
      console.log('EventSelection - Logout successful, navigating to home');
      toast.success('Logout realizado com sucesso!');
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('EventSelection - Error during logout:', error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };
  
  const handlePrivacyPolicyAccept = async () => {
    await refetchCheck();
  };
  
  // Show the privacy policy acceptance modal if needed
  if (needsAcceptance) {
    return (
      <PrivacyPolicyAcceptanceModal
        onAccept={handlePrivacyPolicyAccept}
        onCancel={handleExit}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-4">
        <div className="text-center text-gray-500 text-sm sm:text-base px-4">
          {mode === 'registration' 
            ? 'Não há eventos com inscrições abertas no momento.'
            : 'Você ainda não está inscrito em nenhum evento.'}
        </div>
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          size="sm"
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
          if (event) {
            handleEventAction(eventId, event.isRegistered);
          }
        }}
        isUnderAge={isUnderAge}
      />
      <div className="flex justify-center px-4">
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto max-w-xs"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
