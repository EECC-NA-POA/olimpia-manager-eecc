
import React from 'react';
import { Bell } from 'lucide-react';

export function EmptyNotifications() {
  return (
    <div className="text-center py-8">
      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhuma notificação
      </h3>
      <p className="text-gray-500">
        Não há notificações disponíveis no momento.
      </p>
    </div>
  );
}
