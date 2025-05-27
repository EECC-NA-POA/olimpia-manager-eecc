
import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AthleteCardHeader } from './components/AthleteCardHeader';
import { ScoreForm } from './components/ScoreForm';
import { useAthleteScoreCard } from './hooks/useAthleteScoreCard';
import { getInitialValues } from './utils/initialValuesUtils';
import { AthleteScoreCardProps } from './types';

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
  console.log('AthleteScoreCard - modalityRule prop:', modalityRule);
  console.log('AthleteScoreCard - scoreType prop:', scoreType);

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
            initialValues={getInitialValues(existingScore, modalityRule)}
            onSubmit={handleSubmit}
            isPending={isPending}
            modalityRule={modalityRule}
            eventId={eventId}
          />
        )}
      </CardContent>
    </Card>
  );
}
