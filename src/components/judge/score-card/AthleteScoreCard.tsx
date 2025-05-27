
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

  const { data: bateriasData = [] } = useBateriaData(modalityId, eventId);

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

  console.log('AthleteScoreCard - Rendering for athlete:', athlete.atleta_nome, {
    hasBaterias,
    bateriasTotal: bateriasData.length,
    bateriasPreenchidas: uniqueBateriaIds.size,
    allBateriasFilled,
    batteriaScores: batteriaScores.map(s => ({ bateria_id: s.bateria_id, valor: s.valor_pontuacao }))
  });

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}>
      <AthleteCardHeader
        athlete={athlete}
        existingScore={existingScore}
        medalInfo={medalInfo}
        scoreType={scoreType}
        modalityRule={modalityRule}
      />

      <CardContent className="pt-0 space-y-3">
        {/* Always show bateria scores if there are baterias */}
        {hasBaterias && (
          <BateriaScoresDisplay
            athleteId={athlete.atleta_id}
            modalityId={modalityId}
            eventId={eventId!}
            judgeId={judgeId}
            baterias={bateriasData}
            scoreType={scoreType}
          />
        )}

        {/* Only show the register button if not all baterias are filled */}
        {!allBateriasFilled && (
          <Button 
            variant={isExpanded ? "outline" : "default"}
            size="sm" 
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Esconder formulário" : "Registrar nova pontuação"}
          </Button>
        )}

        {isExpanded && !allBateriasFilled && (
          <ScoreForm 
            modalityId={modalityId}
            initialValues={getInitialValues(existingScore, modalityRule)}
            onSubmit={handleSubmit}
            isPending={isPending}
            modalityRule={modalityRule}
            eventId={eventId}
            showModalityInfo={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
