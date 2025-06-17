
import React from 'react';
import { TeamsTab as JudgeTeamsTab } from '@/components/judge/tabs/TeamsTab';
import { useAuth } from '@/contexts/AuthContext';

interface TeamsTabProps {
  eventId: string | null;
  branchId?: string;
}

export function TeamsTab({ eventId, branchId }: TeamsTabProps) {
  const { user } = useAuth();
  
  if (!eventId || !user?.id) {
    return null;
  }

  // Para representantes de delegação, usar o mesmo componente do organizador
  // mas sem privilégios de organizador
  return (
    <JudgeTeamsTab
      userId={user.id}
      eventId={eventId}
      isOrganizer={false}
    />
  );
}
