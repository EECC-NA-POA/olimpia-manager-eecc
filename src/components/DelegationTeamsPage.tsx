
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TeamsTab } from './judge/tabs/TeamsTab';

export default function DelegationTeamsPage() {
  const { user, currentEventId } = useAuth();

  if (!currentEventId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-olimpics-green-primary mb-4">
            Nenhum evento selecionado
          </h1>
          <p className="text-muted-foreground">
            Selecione um evento para gerenciar as equipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TeamsTab
        userId={user?.id || ''}
        eventId={currentEventId}
        isOrganizer={false}
      />
    </div>
  );
}
