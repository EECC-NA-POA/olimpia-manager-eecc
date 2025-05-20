
import React from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useUserAgeQuery } from './hooks/useUserAgeQuery';
import { ErrorState } from '@/components/ErrorState';
import { LoadingImage } from '@/components/ui/loading-image';
import { useAuth } from '@/contexts/AuthContext';

export function EventSelectionContent() {
  const navigate = useNavigate();
  const { user, setCurrentEventId } = useAuth();
  const { data: userAge, isLoading: isAgeLoading, error: ageError } = useUserAgeQuery();

  const handleEventSelect = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    setCurrentEventId(eventId); // Add this line to update context state
    toast.success("Evento selecionado com sucesso!");
    navigate('/athlete-profile');
  };

  const isUnder13 = userAge !== null && userAge < 13;
  
  if (isAgeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingImage size="sm" />
      </div>
    );
  }
  
  if (ageError) {
    return (
      <ErrorState 
        onRetry={() => window.location.reload()}
        message="Erro ao carregar dados do usuário"
        error={ageError}
      />
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <EventSelection
        selectedEvents={[]}
        onEventSelect={handleEventSelect}
        mode="login"
        isUnderAge={isUnder13}
      />
    </div>
  );
}
