
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
import { useModalityRules } from '../tabs/scores/hooks/useModalityRules';
import { AthleteScoreCardProps, ScoreRecord } from './types';

export function AthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: AthleteScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch modality rules to determine the correct input type
  const { data: modalityRule } = useModalityRules(modalityId);
  
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

  // Fetch medal info from premiacoes
  const { data: medalInfo } = useQuery({
    queryKey: ['medal', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('premiacoes')
        .select('posicao, medalha')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching medal info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Expand form when score exists
  useEffect(() => {
    if (existingScore) {
      setIsExpanded(true);
    }
  }, [existingScore]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false)
    });
  };

  // Prepare initial values from existing score data
  const getInitialValues = () => {
    if (!existingScore || !modalityRule) return null;
    
    const dados = existingScore.dados_json as any;
    
    switch (modalityRule.regra_tipo) {
      case 'tempo':
        return {
          minutes: existingScore.tempo_minutos || 0,
          seconds: existingScore.tempo_segundos || 0,
          milliseconds: existingScore.tempo_milissegundos || 0,
          notes: existingScore.observacoes || ''
        };
        
      case 'distancia':
        if (dados?.meters !== undefined && dados?.centimeters !== undefined) {
          return {
            meters: dados.meters,
            centimeters: dados.centimeters,
            notes: existingScore.observacoes || ''
          };
        }
        return {
          score: existingScore.valor_pontuacao || 0,
          notes: existingScore.observacoes || ''
        };
        
      case 'baterias':
        return {
          tentativas: dados?.tentativas || [],
          notes: existingScore.observacoes || ''
        };
        
      case 'sets':
        return {
          sets: dados?.sets || [],
          notes: existingScore.observacoes || ''
        };
        
      case 'arrows':
        return {
          flechas: dados?.flechas || [],
          notes: existingScore.observacoes || ''
        };
        
      default:
        return {
          score: existingScore.valor_pontuacao || 0,
          notes: existingScore.observacoes || ''
        };
    }
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
            medalInfo={medalInfo || null}
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
            modalityId={modalityId}
            initialValues={getInitialValues()}
            onSubmit={handleSubmit}
            isPending={submitScoreMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
