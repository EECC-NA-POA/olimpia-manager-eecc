import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, UserPlus, Crown } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { useMasterAccess } from '@/hooks/useMasterAccess';
import { useEventData } from '@/hooks/useEventData';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserProfilesManagementSection } from '@/components/event-management/user-profiles/UserProfilesManagementSection';
import { UserManagementSection } from '@/components/administration/user-management/UserManagementSection';
import { Button } from '@/components/ui/button';

export default function Master() {
  const { currentEventId } = useAuth();
  const { isMaster, isLoading: isLoadingPermission } = useMasterAccess();
  const [activeTab, setActiveTab] = useState('user-profiles');
  const { data: eventData, isLoading: isLoadingEvent, refetch } = useEventData(currentEventId);
  const isMobile = useIsMobile();

  // Loading state
  if (isLoadingPermission || isLoadingEvent) {
    return <LoadingState />;
  }

  // If no event data is found
  if (!eventData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Não foi possível carregar as informações do evento.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-olimpics-text">
              Master
            </h1>
          </div>
        </div>

        <Card className="border-yellow-500/20">
          <CardHeader className="bg-yellow-500/5 px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-yellow-600 dark:text-yellow-500 text-base sm:text-lg md:text-xl line-clamp-2">
              {eventData.nome}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="w-full border-b mb-4 sm:mb-8 bg-background grid grid-cols-2 p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1">
                  <TabsTrigger 
                    value="user-profiles"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Perfis" : "Gerenciar Perfis de Usuários"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="user-management"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none whitespace-nowrap"
                  >
                    <UserPlus className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Usuários" : "Gestão de Usuários"}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <TabsContent value="user-profiles" className="mt-2 sm:mt-6">
                  <UserProfilesManagementSection eventId={currentEventId || ''} />
                </TabsContent>

                <TabsContent value="user-management" className="mt-2 sm:mt-6">
                  <UserManagementSection eventId={currentEventId || ''} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
