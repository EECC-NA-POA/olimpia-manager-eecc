
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedalDisplay } from './components/MedalDisplay';
import { ScoreForm } from './components/ScoreForm';
import { useScoreSubmission } from './hooks/useScoreSubmission';
import { AthleteScoreCardProps, ScoreRecord, TimeScoreFormValues, PointsScoreFormValues } from './types';

export function AthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: AthleteScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { submitScoreMutation } = useScoreSubmission(
    eventId, 
    modalityId, 
    athlete, 
    judgeId, 
    scoreType
  );

  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['score', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data as ScoreRecord;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Prepare initial form values based on existing score
  const getInitialFormValues = () => {
    if (!existingScore) {
      return scoreType === 'time' 
        ? { minutes: 0, seconds: 0, milliseconds: 0, notes: '' }
        : { score: 0, notes: '' };
    }
    
    if (scoreType === 'time') {
      return {
        minutes: existingScore.tempo_minutos || 0,
        seconds: existingScore.tempo_segundos || 0,
        milliseconds: existingScore.tempo_milissegundos || 0,
        notes: existingScore.observacoes || ''
      };
    } else {
      return {
        score: existingScore.valor_pontuacao || 0,
        notes: existingScore.observacoes || ''
      };
    }
  };

  // Expand form when score exists
  useEffect(() => {
    if (existingScore) {
      setIsExpanded(true);
    }
  }, [existingScore]);

  // Handle form submission
  const handleSubmit = (data: TimeScoreFormValues | PointsScoreFormValues) => {
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false)
    });
  };

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{athlete.atleta_nome}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {athlete.tipo_documento}: {athlete.numero_documento}
            </p>
            {athlete.numero_identificador && (
              <p className="text-xs text-muted-foreground">
                ID: {athlete.numero_identificador}
              </p>
            )}
          </div>
          
          <MedalDisplay 
            scoreRecord={existingScore || null} 
            scoreType={scoreType} 
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button 
          variant={isExpanded ? "outline" : "default"}
          size="sm" 
          className="w-full my-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Esconder formulário" : "Registrar pontuação"}
        </Button>

        {isExpanded && (
          <ScoreForm 
            scoreType={scoreType}
            initialValues={getInitialFormValues()}
            onSubmit={handleSubmit}
            isPending={submitScoreMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
