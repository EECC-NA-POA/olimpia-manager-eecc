
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { CreateNotificationDialog } from './CreateNotificationDialog';
import { NotificationsList } from './NotificationsList';

interface NotificationManagerProps {
  eventId: string;
  userId: string;
  userBranchId?: string;
  isRepresentanteDelegacao?: boolean;
  isOrganizer?: boolean;
  isDelegationDashboard?: boolean;
}

export function NotificationManager({ 
  eventId, 
  userId, 
  userBranchId,
  isRepresentanteDelegacao = false,
  isOrganizer = false,
  isDelegationDashboard = false
}: NotificationManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-6 px-1 sm:px-0">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-6 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-olimpics-orange-primary flex-shrink-0" />
            <span className="truncate">Gerenciamento de Notificações</span>
          </CardTitle>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto whitespace-nowrap"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Nova Notificação</span>
            <span className="xs:hidden">Nova</span>
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <NotificationsList 
            eventId={eventId} 
            userId={userId}
            isDelegationDashboard={isDelegationDashboard}
          />
        </CardContent>
      </Card>

      <CreateNotificationDialog
        eventId={eventId}
        userId={userId}
        userBranchId={userBranchId}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        isRepresentanteDelegacao={isRepresentanteDelegacao}
        isOrganizer={isOrganizer}
      />
    </div>
  );
}
