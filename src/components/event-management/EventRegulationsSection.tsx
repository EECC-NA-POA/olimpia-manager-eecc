
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

  const { data: hasRegulations, isLoading } = useQuery({
    queryKey: ['hasRegulations', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('eventos_regulamentos')
        .select('*', { count: 'exact', head: true })
        .eq('evento_id', eventId);
      
      if (error) throw error;
      return (count || 0) > 0;
    }
  });

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Regulamentos do Evento</CardTitle>
          <CardDescription>
            Gerencie os regulamentos aplicáveis ao evento
          </CardDescription>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Regulamento
          </Button>
        )}
        {isEditing && (
          <Button variant="outline" onClick={handleBack}>
            Voltar para Lista
          </Button>
        )}
      </CardHeader>
      <CardContent>
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
              <Button onClick={handleAddNew}>
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
