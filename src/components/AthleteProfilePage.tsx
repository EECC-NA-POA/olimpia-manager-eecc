
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteProfile from './AthleteProfile';
import { Loader2 } from "lucide-react";
import { EventHeader } from "./athlete/EventHeader";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";
import { useUserRoleCheck } from "@/hooks/useUserRoleCheck";

export default function AthleteProfilePage() {
  const { user, currentEventId } = useAuth();
  
  const { data: eventData } = useEventData(currentEventId);
  const { data: profile, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);
  const { data: roleCheck } = useUserRoleCheck(user?.id, currentEventId);

  if (profileLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <div className="text-center text-olimpics-text">
          Perfil não encontrado. Por favor, entre em contato com o suporte.
        </div>
      </div>
    );
  }

  // Verificar se é atleta pelo código do papel ou nome
  const isAthleteProfile = profile.papeis?.some(role => 
    role.codigo === 'ATL' || role.nome === 'Atleta'
  ) || false;

  console.log('=== ATHLETE PROFILE PAGE DEBUG ===');
  console.log('Profile data:', profile);
  console.log('User roles (papeis):', profile.papeis);
  console.log('Roles count:', profile.papeis?.length || 0);
  console.log('Is athlete profile:', isAthleteProfile);
  console.log('Current event ID:', currentEventId);
  console.log('User ID:', user?.id);
  console.log('Role check data:', roleCheck);
  console.log('==================================');

  return (
    <div className="space-y-8">
      {eventData && <EventHeader eventData={eventData} />}
      
      <AthleteProfile 
        profile={profile}
        isPublicUser={!isAthleteProfile}
      />
    </div>
  );
}
