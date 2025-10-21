
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, BookOpen, Settings, UserCheck, Shield, CalendarIcon, UserPlus } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useEventData } from '@/hooks/useEventData';
import { EventBasicInfo } from '@/components/event-management/EventBasicInfo';
import { EventBranchesSection } from '@/components/event-management/EventBranchesSection';
import { EventScheduleSection } from '@/components/event-management/EventScheduleSection';
import { EventModalitiesSection } from '@/components/event-management/EventModalitiesSection';
import { EventRegulationsSection } from '@/components/event-management/EventRegulationsSection';
import { ModeloConfigurationSection } from '@/components/event-management/modelo-configuration/ModeloConfigurationSection';
import { EventProfilesSection } from '@/components/event-management/EventProfilesSection';
import { EventAdministrationSection } from '@/components/event-management/EventAdministrationSection';
import { UserProfilesManagementSection } from '@/components/event-management/user-profiles/UserProfilesManagementSection';
import { UserManagementSection } from '@/components/administration/user-management/UserManagementSection';

export default function Administration() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
  const { canCreateEvents, isLoading: isLoadingPermission } = useCanCreateEvents();
  const [activeTab, setActiveTab] = useState('basic-info');
  const { data: eventData, isLoading: isLoadingEvent, refetch } = useEventData(currentEventId);
  const isMobile = useIsMobile();
  
  // Check if user has admin profile
  const hasAdminProfile = user?.papeis?.some(role => role.codigo === 'ADM');
  
  // Redirect if necessary permissions are not present
  useEffect(() => {
    if (!isLoadingPermission && (!canCreateEvents || !hasAdminProfile)) {
      toast.error('Você não tem permissão para acessar a administração');
      navigate('/');
    }

    if (!currentEventId) {
      toast.error('Nenhum evento selecionado');
      navigate('/event-selection');
    }
  }, [canCreateEvents, hasAdminProfile, isLoadingPermission, currentEventId, navigate]);

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-olimpics-text">
            Administração
          </h1>
        </div>

        <Card className="border-olimpics-green-primary/20">
          <CardHeader className="bg-olimpics-green-primary/5 px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-olimpics-green-primary text-base sm:text-lg md:text-xl line-clamp-2">
              {eventData.nome}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="w-full border-b mb-4 sm:mb-8 bg-background grid grid-cols-2 sm:grid-cols-4 lg:flex lg:justify-start lg:space-x-1 p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1">
                  <TabsTrigger 
                    value="basic-info"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Info" : "Informações Básicas"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profiles"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <UserCheck className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Perfis" : "Perfis e Taxas"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="administration"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Gerenciar" : "Gerenciar Perfis de Usuários"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="branches"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Filiais" : "Filiais Vinculadas"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="regulations"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Regulamento" : "Regulamento"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="schedule"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Cronograma" : "Cronograma"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="modalities"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Modalidades" : "Regras de Modalidades"}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="modelo-configuration"
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span>{isMobile ? "Config" : "Configuração de Modelos"}</span>
                  </TabsTrigger>
                  {canCreateEvents && (
                    <TabsTrigger 
                      value="user-management"
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                    >
                      <UserPlus className="h-4 w-4 flex-shrink-0" />
                      <span>{isMobile ? "Usuários" : "Gestão de Usuários"}</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <TabsContent value="basic-info" className="mt-2 sm:mt-6">
                  <EventBasicInfo eventId={currentEventId} eventData={eventData} onUpdate={refetch} />
                </TabsContent>

                <TabsContent value="profiles" className="mt-2 sm:mt-6">
                  <EventProfilesSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="administration" className="mt-2 sm:mt-6">
                  <UserProfilesManagementSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="branches" className="mt-2 sm:mt-6">
                  <EventBranchesSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="regulations" className="mt-2 sm:mt-6">
                  <EventRegulationsSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-2 sm:mt-6">
                  <EventScheduleSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="modalities" className="mt-2 sm:mt-6">
                  <EventModalitiesSection eventId={currentEventId} />
                </TabsContent>

                <TabsContent value="modelo-configuration" className="mt-2 sm:mt-6">
                  <ModeloConfigurationSection eventId={currentEventId} />
                </TabsContent>

                {canCreateEvents && (
                  <TabsContent value="user-management" className="mt-2 sm:mt-6">
                    <UserManagementSection eventId={currentEventId} />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
