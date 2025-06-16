
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from './notifications/NotificationCard';
import { NotificationDetailDialog } from './notifications/NotificationDetailDialog';
import type { Notification } from '@/types/notifications';

interface NotificationsProps {
  eventId: string;
  userId: string;
}

export default function Notifications({ eventId, userId }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId
  });

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedNotification(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-olimpics-orange-primary" />
              Notificações
              {notifications && notifications.length > 0 && (
                <span className="bg-olimpics-orange-primary text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma notificação</p>
                  <p className="text-sm">Você não possui notificações no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <NotificationDetailDialog
        notification={selectedNotification}
        userId={userId}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
