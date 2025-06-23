
import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AthleteCardHeader } from './components/AthleteCardHeader';
import { ScoreForm } from './components/ScoreForm';
import { BateriaScoresDisplay } from './components/BateriaScoresDisplay';
import { useAthleteScoreCard } from './hooks/useAthleteScoreCard';
import { getInitialValues } from './utils/initialValuesUtils';
import { AthleteScoreCardProps } from './types';
import { useBateriaData } from '../tabs/scores/hooks/useBateriaData';
import { useBateriaScores } from './components/bateria-scores/hooks/useBateriaScores';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const {
    isExpanded,
    setIsExpanded,
    existingScore,
    medalInfo,
    handleSubmit,
    isPending
  } = useAthleteScoreCard(
    athlete,
    modalityId,
    eventId,
    judgeId,
    scoreType,
    modalityRule
  );

  const { data: bateriasData = [], isLoading: isLoadingBaterias } = useBateriaData(modalityId, eventId);

  // Use the actual bateria scores data instead of just checking existence
  const { batteriaScores = [] } = useBateriaScores({
    athleteId: athlete.atleta_id,
    modalityId,
    eventId: eventId!,
    baterias: bateriasData
  });

  const hasBaterias = bateriasData.length > 0;
  
  // Check if all baterias have been scored by comparing the number of unique bateria_ids
  const uniqueBateriaIds = new Set(batteriaScores.map(score => score.bateria_id));
  const allBateriasFilled = hasBaterias && bateriasData.length > 0 && 
    uniqueBateriaIds.size >= bateriasData.length;

  console.log('AthleteScoreCard - Debug info for athlete:', athlete.atleta_nome, {
    modalityId,
    eventId,
    modalityRule: modalityRule?.regra_tipo,
    isLoadingBaterias,
    hasBaterias,
    bateriasTotal: bateriasData.length,
    bateriasPreenchidas: uniqueBateriaIds.size,
    allBateriasFilled,
    bateriasData,
    batteriaScores: batteriaScores.map(s => ({ bateria_id: s.bateria_id, valor: s.valor_pontuacao }))
  });

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
      ${isMobile ? 'mx-2' : ''}
    `}>
      <AthleteCardHeader
        athlete={athlete}
        existingScore={existingScore}
        medalInfo={medalInfo}
        scoreType={scoreType}
        modalityRule={modalityRule}
      />

      <CardContent className={`${isMobile ? 'pt-0 p-3' : 'pt-0'} space-y-3`}>
        {/* Show loading state for baterias */}
        {isLoadingBaterias && (
          <div className="text-sm text-muted-foreground">
            Carregando informações das baterias...
          </div>
        )}

        {/* Always show bateria scores if there are baterias */}
        {!isLoadingBaterias && hasBaterias && (
          <BateriaScoresDisplay
            athleteId={athlete.atleta_id}
            modalityId={modalityId}
            eventId={eventId!}
            judgeId={judgeId}
            baterias={bateriasData}
            scoreType={scoreType}
          />
        )}

        {/* Show warning if rule requires baterias but none found */}
        {!isLoadingBaterias && !hasBaterias && modalityRule?.regra_tipo === 'baterias' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-amber-800 text-sm font-medium">
              ⚠️ Nenhuma bateria configurada
            </div>
            <div className="text-amber-700 text-xs mt-1">
              Configure nas regras da modalidade
            </div>
          </div>
        )}

        {/* Only show the register button if not all baterias are filled or if no baterias are needed */}
        {!isLoadingBaterias && !allBateriasFilled && (
          <Button 
            variant={isExpanded ? "outline" : "default"}
            size={isMobile ? "sm" : "sm"}
            className={`w-full ${isMobile ? 'text-xs h-8' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Esconder formulário" : "Registrar nova pontuação"}
          </Button>
        )}

        {isExpanded && !allBateriasFilled && (
          <div className={isMobile ? 'space-y-3' : ''}>
            <ScoreForm 
              modalityId={modalityId}
              initialValues={getInitialValues(existingScore, modalityRule)}
              onSubmit={handleSubmit}
              isPending={isPending}
              modalityRule={modalityRule}
              eventId={eventId}
              showModalityInfo={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
