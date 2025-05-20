
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
import { Calendar, FileText, Users, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useEventData } from '@/hooks/useEventData';
import { EventBasicInfo } from '@/components/event-management/EventBasicInfo';
import { EventBranchesSection } from '@/components/event-management/EventBranchesSection';
import { EventScheduleSection } from '@/components/event-management/EventScheduleSection';
import { EventModalitiesSection } from '@/components/event-management/EventModalitiesSection';

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
      <div className="container mx-auto py-6">
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
          Gerenciamento de Evento
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/administration')}
          className="flex items-center gap-2"
        >
          Voltar para Administração
        </Button>
      </div>

      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <CardTitle className="text-olimpics-green-primary text-xl">
            {eventData.nome}
          </CardTitle>
          <CardDescription>
            ID: {eventData.id} • Status: {eventData.status_evento}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b mb-8 bg-background flex justify-start space-x-2 p-0">
              <TabsTrigger 
                value="basic-info"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
              >
                <FileText className="h-5 w-5" />
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger 
                value="branches"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
              >
                <Users className="h-5 w-5" />
                Filiais Vinculadas
              </TabsTrigger>
              <TabsTrigger 
                value="schedule"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
              >
                <CalendarIcon className="h-5 w-5" />
                Cronograma
              </TabsTrigger>
              <TabsTrigger 
                value="modalities"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
              >
                <Calendar className="h-5 w-5" />
                Modalidades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="mt-6">
              <EventBasicInfo eventId={currentEventId} eventData={eventData} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="branches" className="mt-6">
              <EventBranchesSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <EventScheduleSection eventId={currentEventId} />
            </TabsContent>

            <TabsContent value="modalities" className="mt-6">
              <EventModalitiesSection eventId={currentEventId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
