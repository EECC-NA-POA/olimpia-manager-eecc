
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from '@/components/AthleteScoresSection';
import { useEventData } from '@/hooks/useEventData';

export default function Scores() {
  const { user, currentEventId } = useAuth();

  // Get current event data for verification
  const { data: currentEvent } = useEventData(currentEventId);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold text-olimpics-green-primary">
        Minhas Pontuações
      </h1>
      {currentEvent && (
        <AthleteScoresSection 
          athleteId={user.id} 
          eventId={currentEventId} 
        />
      )}
    </div>
  );
}
