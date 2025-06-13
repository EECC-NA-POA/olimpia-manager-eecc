
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, Users, Edit, Calendar as CalendarIcon, BookOpen, Settings, UserCheck } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useEventData } from '@/hooks/useEventData';
import { EventBasicInfo } from '@/components/event-management/EventBasicInfo';
import { EventBranchesSection } from '@/components/event-management/EventBranchesSection';
import { EventScheduleSection } from '@/components/event-management/EventScheduleSection';
import { EventModalitiesSection } from '@/components/event-management/EventModalitiesSection';
import { EventRegulationsSection } from '@/components/event-management/EventRegulationsSection';
import { ModeloConfigurationSection } from '@/components/event-management/modelo-configuration/ModeloConfigurationSection';
import { ModalityRepresentativesSection } from '@/components/event-management/ModalityRepresentativesSection';

export default function EventManagement() {
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
      toast.error('Você não tem permissão para gerenciar eventos');
      navigate('/administration');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-olimpics-text">
          Gerenciamento de Evento
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/administration')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          Voltar para Administração
        </Button>
      </div>

      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <CardTitle className="text-olimpics-green-primary text-lg sm:text-xl">
            {eventData.nome}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full min-w-max border-b mb-8 bg-background grid grid-cols-2 md:flex md:justify-start md:space-x-2 p-0 h-auto gap-1 md:gap-0">
                <TabsTrigger 
                  value="basic-info"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Informações Básicas</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="branches"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Filiais Vinculadas</span>
                  <span className="sm:hidden">Filiais</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="regulations"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Regulamento</span>
                  <span className="sm:hidden">Reg.</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Cronograma</span>
                  <span className="sm:hidden">Agenda</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="modalities"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Modalidades</span>
                  <span className="sm:hidden">Mod.</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="representatives"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Representantes</span>
                  <span className="sm:hidden">Rep.</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="modelo-configuration"
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
                >
                  <Settings className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Configuração de Modelos</span>
                  <span className="sm:hidden">Config</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic-info" className="mt-6">
              <EventBasicInfo eventId={currentEventId} eventData={eventData} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="branches" className="mt-6">
              <EventBranchesSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="regulations" className="mt-6">
              <EventRegulationsSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <EventScheduleSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="modalities" className="mt-6">
              <EventModalitiesSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="representatives" className="mt-6">
              <ModalityRepresentativesSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="modelo-configuration" className="mt-6">
              <ModeloConfigurationSection eventId={currentEventId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
