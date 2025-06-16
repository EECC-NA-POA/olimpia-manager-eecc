
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from './notifications/NotificationCard';
import { EmptyNotifications } from './notifications/EmptyNotifications';

interface NotificationsProps {
  eventId: string;
  userId: string;
  userProfiles?: Array<{ id?: number; codigo: string; nome: string; }>;
}

export default function Notifications({ eventId, userId, userProfiles }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId, 
    userProfiles 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.lida).length || 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-olimpics-orange-primary" />
            Notificações
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
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
              <EmptyNotifications />
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification}
                    userId={userId}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
