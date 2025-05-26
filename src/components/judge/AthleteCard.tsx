
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
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  eventId?: string | null;
  judgeId?: string;
  modalityRule?: any; // Add modality rule prop
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
  
  // Fetch athlete data using custom hooks
  const { data: paymentData, isLoading: isLoadingPayment } = useAthletePaymentData(athlete.atleta_id, eventId);
  const { data: branchData, isLoading: isLoadingBranch } = useAthleteBranchData(athlete.atleta_id);
  const { data: scores } = useAthleteScores(athlete.atleta_id);
  
  // Check if the athlete has a score for the selected modality
  const hasScoreForCurrentModality = modalityId ? 
    scores?.some(score => score.modalidade_id === modalityId) : 
    false;

  // Get athlete identifier from payment data or fallback to ID slice
  const athleteIdentifier = paymentData?.numero_identificador || athlete.atleta_id.slice(-6);

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
      
      <CardHeader className="pb-3 pt-6">
        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
          {athlete.atleta_nome}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
            ID: {athleteIdentifier}
          </span>
          {branchData?.nome && (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
              {branchData.nome}
            </span>
          )}
          {branchData?.estado && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
              {branchData.estado}
            </span>
          )}
        </div>
        {modalityRule && (
          <div className="mt-2 text-xs bg-orange-50 text-orange-700 p-2 rounded border border-orange-200">
            Tipo: {modalityRule.regra_tipo}
            {modalityRule.parametros?.unidade && ` (${modalityRule.parametros.unidade})`}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <AthleteInfo 
          athlete={athlete}
          athleteIdentifier={athleteIdentifier}
          hasScoreForCurrentModality={hasScoreForCurrentModality}
        />
      </CardContent>
    </Card>
  );
}
