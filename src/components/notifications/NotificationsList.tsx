
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsListProps {
  eventId: string;
  isBranchFiltered?: boolean;
  branchId?: number;
}

export function NotificationsList({ 
  eventId, 
  isBranchFiltered = false, 
  branchId 
}: NotificationsListProps) {
  // TODO: Implementar hook para buscar notificações do evento
  const notifications: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Nenhuma notificação encontrada para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className="border-l-4 border-l-olimpics-orange-primary">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-olimpics-text">
                    {notification.titulo}
                  </h4>
                  <Badge variant={notification.ativa ? "default" : "secondary"}>
                    {notification.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                  <Badge variant="outline">
                    {notification.tipo_destinatario === 'todos' ? 'Todos' :
                     notification.tipo_destinatario === 'perfil' ? 'Por Perfil' :
                     notification.tipo_destinatario === 'filial' ? 'Por Filial' : 'Individual'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.conteudo}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Criada em: {format(new Date(notification.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                  {notification.data_expiracao && (
                    <span>
                      Expira em: {format(new Date(notification.data_expiracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
