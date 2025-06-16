
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { CreateNotificationDialog } from './CreateNotificationDialog';
import { NotificationsList } from './NotificationsList';

interface NotificationManagerProps {
  eventId: string;
  userId: string;
  isRepresentanteDelegacao?: boolean;
  isOrganizer?: boolean;
}

export function NotificationManager({ 
  eventId, 
  userId, 
  isRepresentanteDelegacao = false,
  isOrganizer = false
}: NotificationManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-olimpics-orange-primary" />
            Gerenciamento de Notificações
          </CardTitle>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Notificação
          </Button>
        </CardHeader>
        <CardContent>
          <NotificationsList eventId={eventId} />
        </CardContent>
      </Card>

      <CreateNotificationDialog
        eventId={eventId}
        userId={userId}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        isRepresentanteDelegacao={isRepresentanteDelegacao}
        isOrganizer={isOrganizer}
      />
    </div>
  );
}
