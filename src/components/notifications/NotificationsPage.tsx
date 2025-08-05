import React, { useState, useMemo } from 'react';
import { Search, Bell, CheckCheck, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/athlete/notifications/NotificationCard';
import { NotificationDetailDialog } from '@/components/athlete/notifications/NotificationDetailDialog';
import type { Notification } from '@/types/notifications';

interface NotificationsPageProps {
  eventId: string;
  userId: string;
}

export function NotificationsPage({ eventId, userId }: NotificationsPageProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('unread');

  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId 
  });

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    if (!notifications) return { unread: [], all: [] };

    const unread = notifications.filter(n => !n.lida);
    const all = notifications;

    if (!searchQuery) {
      return { unread, all };
    }

    const query = searchQuery.toLowerCase();
    const filterFn = (n: Notification) => 
      n.titulo.toLowerCase().includes(query) || 
      n.mensagem.toLowerCase().includes(query) ||
      n.autor_nome.toLowerCase().includes(query);

    return {
      unread: unread.filter(filterFn),
      all: all.filter(filterFn)
    };
  }, [notifications, searchQuery]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedNotification(null);
  };

  const unreadCount = filteredNotifications.unread.length;
  const totalCount = filteredNotifications.all.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary mx-auto" />
          <p className="text-olimpics-text-secondary">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  const NotificationsList = ({ notificationsList }: { notificationsList: Notification[] }) => (
    <ScrollArea className="h-[calc(100vh-300px)] lg:h-[calc(100vh-350px)]">
      <div className="space-y-3 p-1">
        {notificationsList.length === 0 ? (
          <div className="text-center py-12 text-olimpics-text-secondary">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
            </p>
            <p className="text-sm">
              {searchQuery 
                ? 'Tente ajustar os termos de busca.' 
                : selectedTab === 'unread' 
                  ? 'Você não possui notificações não lidas no momento.'
                  : 'Você ainda não recebeu notificações neste evento.'
              }
            </p>
          </div>
        ) : (
          notificationsList.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-olimpics-orange-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-olimpics-orange-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-olimpics-text">
              Notificações
            </h1>
            <p className="text-sm text-olimpics-text-secondary">
              {totalCount === 0 
                ? 'Nenhuma notificação disponível'
                : `${totalCount} notificação${totalCount > 1 ? 'ões' : ''} • ${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notifications Content */}
      <Card>
        <CardHeader className="pb-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Não Lidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Todas
                <Badge variant="secondary" className="text-xs">
                  {totalCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsContent value="unread" className="m-0">
              <div className="p-4 lg:p-6">
                <NotificationsList notificationsList={filteredNotifications.unread} />
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="m-0">
              <div className="p-4 lg:p-6">
                <NotificationsList notificationsList={filteredNotifications.all} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        userId={userId}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}