
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsProps {
  eventId: string;
  userId: string;
}

export default function Notifications({ eventId, userId }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  return (
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
                  <Card key={notification.id} className="border-l-4 border-l-olimpics-orange-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{notification.autor_nome}</span>
                          <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                            {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(notification.criado_em), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: notification.mensagem }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
