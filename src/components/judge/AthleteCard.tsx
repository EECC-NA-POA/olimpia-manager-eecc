
import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Athlete } from './tabs/scores/hooks/useAthletes';
import { AthleteScoreCard } from './score-card/AthleteScoreCard';
import { AthleteScoreStatus } from './components/AthleteScoreStatus';
import { AthleteCardHeader } from './AthleteCard/components/AthleteCardHeader';
import { BateriaScoresSection } from './AthleteCard/components/BateriaScoresSection';
import { AthleteStatusBadge } from './AthleteCard/components/AthleteStatusBadge';
import { useAthleteCardData } from './AthleteCard/hooks/useAthleteCardData';
import { useScoreHandling } from './AthleteCard/hooks/useScoreHandling';

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
  modalityId?: number;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  eventId?: string | null;
  judgeId?: string;
  modalityRule?: any;
}

export function AthleteCard({ 
  athlete, 
  isSelected, 
  onClick, 
  modalityId,
  scoreType = 'pontos',
  eventId,
  judgeId,
  modalityRule
}: AthleteCardProps) {
  console.log('=== ATHLETE CARD PROPS DEBUG ===');
  console.log('Received eventId prop:', eventId);
  console.log('Received modalityRule:', modalityRule);
  
  const {
    branchData,
    bateriasData,
    batteriaScores,
    hasScoreForCurrentModality,
    athleteIdentifier
  } = useAthleteCardData({
    athleteId: athlete.atleta_id,
    modalityId,
    eventId
  });

  const { handleScoreUpdate } = useScoreHandling({
    athleteId: athlete.atleta_id,
    modalityId,
    eventId,
    judgeId,
    scoreType
  });

  console.log('Final athlete identifier used:', athleteIdentifier);
  console.log('=== AthleteCard Debug End ===');

  // If we're in selected view and have all necessary props, render the score card
  if (isSelected && modalityId && eventId && judgeId && scoreType) {
    return (
      <AthleteScoreCard 
        athlete={{
          atleta_id: athlete.atleta_id,
          atleta_nome: athlete.atleta_nome,
          tipo_documento: athlete.tipo_documento,
          numero_documento: athlete.numero_documento,
          numero_identificador: athleteIdentifier
        }}
        modalityId={modalityId}
        eventId={eventId}
        judgeId={judgeId}
        scoreType={scoreType}
        modalityRule={modalityRule}
      />
    );
  }

  return (
    <Card 
      className={`
        group cursor-pointer transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02] hover:border-primary/50
        ${isSelected ? 'border-primary shadow-md scale-[1.01]' : 'shadow-sm'}
        bg-white overflow-hidden relative
      `}
      onClick={onClick}
    >
      <AthleteScoreStatus 
        hasScoreForCurrentModality={hasScoreForCurrentModality}
        modalityId={modalityId}
      />
      
      <AthleteCardHeader
        athleteName={athlete.atleta_nome}
        athleteIdentifier={athleteIdentifier}
        branchName={branchData?.nome}
        branchState={branchData?.estado}
      />
      
      <CardContent className="pt-0 space-y-4">
        <BateriaScoresSection
          bateriasData={bateriasData}
          batteriaScores={batteriaScores}
          scoreType={scoreType}
          onScoreUpdate={handleScoreUpdate}
        />

        <AthleteStatusBadge
          hasScoreForCurrentModality={hasScoreForCurrentModality}
        />
      </CardContent>
    </Card>
  );
}
