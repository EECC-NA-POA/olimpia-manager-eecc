
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { EventRegulation } from '@/lib/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { EmptyState } from '@/components/dashboard/components/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegulationForm } from '@/components/event-management/regulation/RegulationForm';
import { RegulationsList } from '@/components/event-management/regulation/RegulationsList';

interface EventRegulationsSectionProps {
  eventId: string | null;
}

export function EventRegulationsSection({ eventId }: EventRegulationsSectionProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<string>('list');
  const [selectedRegulation, setSelectedRegulation] = React.useState<EventRegulation | null>(null);
  
  const {
    data: regulations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['event-regulations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('eventos_regulamentos')
        .select('*')
        .eq('evento_id', eventId)
        .order('versao', { ascending: false });
      
      if (error) throw error;
      
      return data as EventRegulation[];
    },
    enabled: !!eventId
  });

  useEffect(() => {
    // Reset the form when changing events
    setSelectedRegulation(null);
    setActiveTab('list');
  }, [eventId]);

  const handleCreateNew = () => {
    setSelectedRegulation(null);
    setActiveTab('form');
  };

  const handleEditRegulation = (regulation: EventRegulation) => {
    setSelectedRegulation(regulation);
    setActiveTab('form');
  };

  const handleFormComplete = () => {
    refetch();
    setActiveTab('list');
    setSelectedRegulation(null);
  };

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState 
            title="Erro ao carregar regulamentos"
            description="Não foi possível carregar os regulamentos do evento."
            action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Regulamentos do Evento</h2>
          {activeTab === 'list' && (
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Novo Regulamento
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Lista de Regulamentos</TabsTrigger>
            <TabsTrigger value="form" disabled={activeTab !== 'form'}>
              {selectedRegulation ? 'Editar Regulamento' : 'Novo Regulamento'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <RegulationsList 
              regulations={regulations || []} 
              onEdit={handleEditRegulation}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="form">
            <RegulationForm 
              eventId={eventId || ''} 
              regulation={selectedRegulation}
              userId={user?.id || ''}
              onComplete={handleFormComplete}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
