
import React from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useUserAgeQuery } from './hooks/useUserAgeQuery';

export function EventSelectionContent() {
  const navigate = useNavigate();
  const { data: userAge } = useUserAgeQuery();

  const handleEventSelect = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    toast.success("Evento selecionado com sucesso!");
    navigate('/athlete-profile');
  };

  const isUnder13 = userAge !== null && userAge < 13;

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
