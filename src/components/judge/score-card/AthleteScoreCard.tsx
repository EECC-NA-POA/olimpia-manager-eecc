
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

  const hasBaterias = bateriasData.length > 0;

  console.log('AthleteScoreCard - Rendering for athlete:', athlete.atleta_nome, 'hasBaterias:', hasBaterias, 'bateriasData:', bateriasData);

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

        <Button 
          variant={isExpanded ? "outline" : "default"}
          size="sm" 
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Esconder formulário" : "Registrar nova pontuação"}
        </Button>

        {isExpanded && (
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
