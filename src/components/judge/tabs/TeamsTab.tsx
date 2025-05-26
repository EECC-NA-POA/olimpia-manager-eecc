
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JudgeTeamsTab } from '../scoring/JudgeTeamsTab';
import { ManagementTeamsTab } from '../../management/teams/ManagementTeamsTab';
import { AdminTeamsTab } from '../../admin/teams/AdminTeamsTab';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const { user } = useAuth();
  
  // Check user roles
  const isJudgeOnly = user?.papeis?.some(role => role.codigo === 'JUZ') && 
                      !user?.papeis?.some(role => role.codigo === 'RDD') &&
                      !user?.papeis?.some(role => role.codigo === 'ORE') &&
                      !user?.papeis?.some(role => role.codigo === 'ADM');

  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD');
  const isOrganizerRole = user?.papeis?.some(role => role.codigo === 'ORE');
  const isAdmin = user?.papeis?.some(role => role.codigo === 'ADM');

  // Route to appropriate component based on role
  if (isAdmin) {
    return (
      <AdminTeamsTab
        userId={userId}
        eventId={eventId}
      />
    );
  }

  if (isJudgeOnly) {
    return (
      <JudgeTeamsTab
        userId={userId}
        eventId={eventId}
      />
    );
  }

  if (isDelegationRep || isOrganizerRole) {
    return (
      <ManagementTeamsTab
        userId={userId}
        eventId={eventId}
        isOrganizer={isOrganizerRole}
      />
    );
  }

  // Fallback - should not reach here but handle gracefully
  return (
    <ManagementTeamsTab
      userId={userId}
      eventId={eventId}
      isOrganizer={isOrganizer}
    />
  );
}
