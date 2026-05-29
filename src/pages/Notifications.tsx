import React from 'react';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingImage } from '@/components/ui/loading-image';

export default function Notifications() {
  const { user, currentEventId } = useAuth();

  if (!user || !currentEventId) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingImage text="Carregando notificações..." />
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