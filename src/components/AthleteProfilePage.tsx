
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteProfile from './AthleteProfile';
import { Loader2 } from "lucide-react";
import { EventHeader } from "./athlete/EventHeader";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  const { data: eventData } = useEventData(currentEventId);
  const { data: profile, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);

  if (profileLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="text-center text-olimpics-text">
          Perfil não encontrado. Por favor, entre em contato com o suporte.
        </div>
      </div>
    );
  }

  const isAthleteProfile = profile.papeis?.some(role => role.nome === 'Atleta');

  return (
    <div className="container mx-auto py-6 space-y-8">
      {eventData && <EventHeader eventData={eventData} />}
      
      <AthleteProfile 
        profile={profile}
        isPublicUser={!isAthleteProfile}
      />
    </div>
  );
}
