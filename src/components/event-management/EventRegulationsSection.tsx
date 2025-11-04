
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RegulationsList } from './regulation/RegulationsList';
import { RegulationForm } from './regulation/RegulationForm';
import { EventRegulation } from '@/lib/types/database';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/dashboard/components/EmptyState';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useAuth } from '@/contexts/AuthContext';

interface EventRegulationsSectionProps {
  eventId: string;
}

export function EventRegulationsSection({ eventId }: EventRegulationsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegulation, setCurrentRegulation] = useState<EventRegulation | null>(null);
  const { user } = useAuth();

  const { data: regulations, isLoading } = useQuery({
    queryKey: ['regulations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_regulamentos')
        .select('*')
        .eq('evento_id', eventId)
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data as EventRegulation[];
    }
  });

  const hasRegulations = regulations && regulations.length > 0;

  const handleEdit = (regulation: EventRegulation) => {
    setCurrentRegulation(regulation);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentRegulation({
      id: '',
      evento_id: eventId,
      versao: '1.0',
      titulo: '',
      regulamento_texto: '',
      regulamento_link: null,
      is_ativo: true,
      criado_por: '',
      criado_em: '',
      atualizado_por: null,
      atualizado_em: null
    });
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setCurrentRegulation(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 px-3 sm:px-6 py-3 sm:py-6">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">Regulamentos do Evento</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gerencie os regulamentos aplicáveis ao evento
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button 
              onClick={handleAddNew} 
              className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Adicionar Regulamento</span>
              <span className="xs:hidden">Adicionar</span>
            </Button>
          )}
          {isEditing && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="w-full sm:w-auto text-xs sm:text-sm"
              size="sm"
            >
              Voltar para Lista
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {isEditing ? (
          <RegulationForm 
            eventId={eventId} 
            regulation={currentRegulation} 
            userId={user?.id || ''}
            onComplete={handleBack}
            onCancel={handleBack}
          />
        ) : hasRegulations ? (
          <RegulationsList 
            eventId={eventId}
            onEdit={handleEdit}
          />
        ) : (
          <EmptyState
            title="Nenhum regulamento cadastrado"
            description="Adicione um novo regulamento para o evento."
            action={
              <Button onClick={handleAddNew} size="sm" className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Regulamento
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
