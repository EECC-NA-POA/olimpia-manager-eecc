
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, BookOpen, Settings, UserCheck, Shield, CalendarIcon } from 'lucide-react';
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

export default function Administration() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
  const { canCreateEvents, isLoading: isLoadingPermission } = useCanCreateEvents();
  const [activeTab, setActiveTab] = useState('basic-info');
  const { data: eventData, isLoading: isLoadingEvent, refetch } = useEventData(currentEventId);
  
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
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full">
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
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="w-full min-w-max border-b mb-4 sm:mb-8 bg-background grid grid-cols-2 sm:grid-cols-4 lg:flex lg:justify-start lg:space-x-1 p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1">
                  <TabsTrigger 
                    value="basic-info"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Info</span>
                    <span className="hidden sm:inline lg:hidden">Informações</span>
                    <span className="hidden lg:inline">Informações Básicas</span>
                    <span className="xs:hidden text-[10px]">In</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profiles"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Perfis</span>
                    <span className="hidden sm:inline lg:hidden">Perfis</span>
                    <span className="hidden lg:inline">Perfis e Taxas</span>
                    <span className="xs:hidden text-[10px]">Pe</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="administration"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Gerenciar</span>
                    <span className="hidden sm:inline lg:hidden">Gerenciar</span>
                    <span className="hidden lg:inline">Gerenciar Perfis</span>
                    <span className="xs:hidden text-[10px]">Ge</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="branches"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Filiais</span>
                    <span className="hidden sm:inline lg:hidden">Filiais</span>
                    <span className="hidden lg:inline">Filiais Vinculadas</span>
                    <span className="xs:hidden text-[10px]">Fi</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="regulations"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Regulamento</span>
                    <span className="xs:hidden text-[10px]">Re</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="schedule"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Cronograma</span>
                    <span className="xs:hidden text-[10px]">Cr</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="modalities"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline">Modalidades</span>
                    <span className="xs:hidden text-[10px]">Mo</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="modelo-configuration"
                    className="flex items-center gap-1 px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Config</span>
                    <span className="hidden sm:inline lg:hidden">Configuração</span>
                    <span className="hidden lg:inline">Configuração de Modelos</span>
                    <span className="xs:hidden text-[10px]">Co</span>
                  </TabsTrigger>
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
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
