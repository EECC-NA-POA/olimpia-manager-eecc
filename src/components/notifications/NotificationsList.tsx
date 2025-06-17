
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from '@/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, EyeOff, Users } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationReadersDialog } from './NotificationReadersDialog';

interface NotificationsListProps {
  eventId: string;
  userId?: string;
}

export function NotificationsList({ eventId, userId }: NotificationsListProps) {
  const [selectedNotificationForReaders, setSelectedNotificationForReaders] = useState<string | null>(null);
  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId 
  });
  const queryClient = useQueryClient();

  const handleVisibilityToggle = async (notificationId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ visivel: !currentVisibility })
        .eq('id', notificationId)
        .eq('autor_id', userId); // Só permite alterar se for o autor

      if (error) {
        console.error('Error updating notification visibility:', error);
        toast.error('Erro ao atualizar visibilidade da notificação');
        return;
      }

      toast.success(`Notificação ${!currentVisibility ? 'habilitada' : 'desabilitada'} com sucesso`);
      
      // Atualizar a query
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Error in handleVisibilityToggle:', error);
      toast.error('Erro ao atualizar visibilidade da notificação');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma notificação encontrada para este evento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notifications.map((notification) => {
          const isAuthor = notification.autor_id === userId;
          
          return (
            <Card key={notification.id} className={!notification.visivel ? 'opacity-60 border-dashed' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{notification.titulo}</CardTitle>
                    {!notification.visivel && (
                      <Badge variant="secondary" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Oculta
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                      {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.criado_em), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Autor:</strong> {notification.autor_nome}
                </div>

                {/* Controles do autor */}
                {isAuthor && (
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Visível para atletas:</span>
                      <Switch
                        checked={notification.visivel}
                        onCheckedChange={() => handleVisibilityToggle(notification.id, notification.visivel)}
                      />
                      {notification.visivel ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNotificationForReaders(notification.id)}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Ver Leituras
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: notification.mensagem }}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NotificationReadersDialog
        notificationId={selectedNotificationForReaders}
        isOpen={!!selectedNotificationForReaders}
        onClose={() => setSelectedNotificationForReaders(null)}
      />
    </>
  );
}
