
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ScoreFormContainer } from './score-form/ScoreFormContainer';
import { Modality } from '@/lib/types/database';

interface AthleteScoreFormProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
}

export function AthleteScoreForm({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId 
}: AthleteScoreFormProps) {
  // Get modality details to determine score type
  const { data: modality } = useQuery({
    queryKey: ['modality-details', modalityId],
    queryFn: async () => {
      if (!modalityId) return null;
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_pontuacao, tipo_modalidade')
        .eq('id', modalityId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modality details:', error);
        toast.error('Erro ao carregar detalhes da modalidade');
        return null;
      }
      
      return {
        modalidade_id: data?.id,
        modalidade_nome: data?.nome,
        tipo_pontuacao: data?.tipo_pontuacao || 'pontos',
        tipo_modalidade: data?.tipo_modalidade
      } as Modality;
    },
    enabled: !!modalityId,
  });

  if (!modality) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">Carregando detalhes da modalidade...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScoreFormContainer 
      athleteId={athleteId}
      modalityId={modalityId}
      eventId={eventId}
      judgeId={judgeId}
      modality={modality}
    />
  );
}
