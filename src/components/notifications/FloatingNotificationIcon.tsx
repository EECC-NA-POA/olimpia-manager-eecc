
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export function FloatingNotificationIcon() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
  
  const { data: notifications } = useNotifications({ 
    eventId: currentEventId, 
    userId: user?.id
  });

  // Contar notificações não lidas
  const unreadCount = notifications?.filter(notification => !notification.lida).length || 0;

  // Se não há notificações não lidas, não mostrar o ícone
  if (unreadCount === 0) {
    return null;
  }

  const handleClick = () => {
    navigate('/athlete-profile');
  };

  return (
    <div 
      className="fixed bottom-20 right-4 z-50 md:bottom-4 md:right-4"
      onClick={handleClick}
    >
      <div className="relative cursor-pointer">
        <div className="bg-olimpics-orange-primary text-white p-3 rounded-full shadow-lg hover:bg-olimpics-orange-secondary transition-colors">
          <AlarmClock className="h-6 w-6" />
        </div>
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </div>
  );
}
