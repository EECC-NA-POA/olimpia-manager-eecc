
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
import { AthleteScoreCardProps, ScoreRecord } from './types';

interface ExtendedAthleteScoreCardProps extends AthleteScoreCardProps {
  modalityRule?: any;
}

export function AthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType,
  modalityRule
}: ExtendedAthleteScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log('AthleteScoreCard - modalityRule prop:', modalityRule);
  console.log('AthleteScoreCard - scoreType prop:', scoreType);

  const { submitScoreMutation } = useScoreSubmission(
    eventId, 
    modalityId, 
    athlete, 
    judgeId, 
    scoreType,
    modalityRule
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
    console.log('AthleteScoreCard - Submitting data:', data);
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false)
    });
  };

  // Prepare initial values from existing score data
  const getInitialValues = () => {
    if (!existingScore || !modalityRule) return null;
    
    const dados = existingScore.dados_json as any;
    console.log('AthleteScoreCard - existingScore dados_json:', dados);
    
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
          let initialData: any = {
            meters: dados.meters,
            centimeters: dados.centimeters,
            notes: existingScore.observacoes || ''
          };
          
          // Add heat and lane data if present
          if (dados.heat !== undefined) {
            initialData.heat = dados.heat;
          }
          if (dados.lane !== undefined) {
            initialData.lane = dados.lane;
          }
          
          return initialData;
        }
        return {
          score: existingScore.valor_pontuacao || 0,
          notes: existingScore.observacoes || ''
        };
        
      case 'baterias':
        return {
          tentativas: dados?.tentativas || Array.from({ length: modalityRule.parametros?.num_tentativas || 3 }, () => ({ valor: 0, raia: '' })),
          notes: existingScore.observacoes || ''
        };
        
      case 'sets':
        const melhorDe = modalityRule.parametros?.melhor_de || modalityRule.parametros?.num_sets || 3;
        const pontuaPorSet = modalityRule.parametros?.pontua_por_set !== false;
        const isVolleyball = modalityRule.parametros?.pontos_por_set !== undefined;
        
        if (pontuaPorSet) {
          return {
            sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ pontos: 0 })),
            notes: existingScore.observacoes || ''
          };
        } else if (isVolleyball) {
          return {
            sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ 
              vencedor: undefined, 
              pontosEquipe1: 0, 
              pontosEquipe2: 0 
            })),
            notes: existingScore.observacoes || ''
          };
        } else {
          return {
            sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ vencedor: undefined })),
            notes: existingScore.observacoes || ''
          };
        }
        
      case 'arrows':
        const faseClassificacao = modalityRule.parametros?.fase_classificacao || false;
        const faseEliminacao = modalityRule.parametros?.fase_eliminacao || false;
        
        if (faseClassificacao || faseEliminacao) {
          let initialData: any = { notes: existingScore.observacoes || '' };
          
          if (faseClassificacao && dados?.classificationArrows) {
            initialData.classificationArrows = dados.classificationArrows;
          }
          
          if (faseEliminacao && dados?.eliminationSets) {
            initialData.eliminationSets = dados.eliminationSets;
            initialData.totalMatchPoints = dados.totalMatchPoints || 0;
            initialData.combatFinished = dados.combatFinished || false;
            initialData.needsShootOff = dados.needsShootOff || false;
            
            if (dados.shootOffScore !== undefined) {
              initialData.shootOffScore = dados.shootOffScore;
            }
          }
          
          return initialData;
        } else {
          return {
            flechas: dados?.flechas || Array.from({ length: modalityRule.parametros?.num_flechas || 6 }, () => ({ zona: '0' })),
            notes: existingScore.observacoes || ''
          };
        }
        
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
            {modalityRule && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                Modalidade: {modalityRule.regra_tipo}
                {modalityRule.parametros?.unidade && ` (${modalityRule.parametros.unidade})`}
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
            modalityRule={modalityRule}
            eventId={eventId}
          />
        )}
      </CardContent>
    </Card>
  );
}
