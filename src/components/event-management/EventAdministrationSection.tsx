
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';
import { NotificationManager } from '@/components/notifications/NotificationManager';

interface EventAdministrationSectionProps {
  eventId: string | null;
}

export function EventAdministrationSection({ eventId }: EventAdministrationSectionProps) {
  if (!eventId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum evento selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Notificações do Evento
          </CardTitle>
          <CardDescription>
            Gerencie as notificações e comunicações com os participantes do evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationManager eventId={eventId} />
        </CardContent>
      </Card>
    </div>
  );
}
