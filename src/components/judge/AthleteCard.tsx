
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Athlete } from './tabs/scores/hooks/useAthletes';
import { AthleteScoreCard } from './score-card/AthleteScoreCard';
import { AthleteScoreStatus } from './components/AthleteScoreStatus';
import { AthleteInfo } from './components/AthleteInfo';
import { useAthletePaymentData, useAthleteBranchData, useAthleteScores } from './hooks/useAthleteData';

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
  modalityId?: number;
  scoreType?: 'time' | 'distance' | 'points';
  eventId?: string | null;
  judgeId?: string;
}

export function AthleteCard({ 
  athlete, 
  isSelected, 
  onClick, 
  modalityId,
  scoreType = 'points',
  eventId,
  judgeId
}: AthleteCardProps) {
  // Fetch athlete data using custom hooks
  const { data: paymentData } = useAthletePaymentData(athlete.atleta_id, eventId);
  const { data: branchData } = useAthleteBranchData(athlete.atleta_id);
  const { data: scores } = useAthleteScores(athlete.atleta_id);
  
  // Check if the athlete has a score for the selected modality
  const hasScoreForCurrentModality = modalityId ? 
    scores?.some(score => score.modalidade_id === modalityId) : 
    false;

  // Get athlete identifier or fallback to ID slice
  const athleteIdentifier = paymentData?.numero_identificador || athlete.atleta_id.slice(-6);

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
      />
    );
  }

  return (
    <Card 
      className={`
        cursor-pointer hover:border-primary/50 transition-colors overflow-hidden
        ${isSelected ? 'border-primary' : ''}
      `}
      onClick={onClick}
    >
      <AthleteScoreStatus 
        hasScoreForCurrentModality={hasScoreForCurrentModality}
        modalityId={modalityId}
      />
      
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-base">{athlete.atleta_nome}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <AthleteInfo 
          athlete={athlete}
          athleteIdentifier={athleteIdentifier}
          branchName={branchData?.nome}
          branchState={branchData?.estado}
          hasScoreForCurrentModality={hasScoreForCurrentModality}
        />
      </CardContent>
    </Card>
  );
}
