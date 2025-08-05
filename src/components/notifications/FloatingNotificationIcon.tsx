
import React from 'react';
import { AlarmClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export function FloatingNotificationIcon() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
  
  const { data: notifications } = useNotifications({ 
    eventId: currentEventId, 
    userId: user?.id
  });

  // Count unread notifications
  const unreadCount = notifications?.filter(notification => !notification.lida).length || 0;

  // Don't show the icon if there are no unread notifications
  if (unreadCount === 0) {
    return null;
  }

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        size="lg"
        className="relative bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary text-white rounded-full shadow-lg p-3 h-14 w-14"
      >
        <AlarmClock className="h-6 w-6" />
        <Badge 
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-6 h-6 flex items-center justify-center rounded-full border-2 border-white"
        >
          {unreadCount}
        </Badge>
      </Button>
    </div>
  );
}
