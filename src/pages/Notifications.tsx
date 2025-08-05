import React from 'react';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';
import { useAuth } from '@/contexts/AuthContext';

export default function Notifications() {
  const { user, currentEventId } = useAuth();

  if (!user || !currentEventId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary mx-auto" />
          <p className="text-olimpics-text-secondary">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationsPage 
      eventId={currentEventId}
      userId={user.id}
    />
  );
}