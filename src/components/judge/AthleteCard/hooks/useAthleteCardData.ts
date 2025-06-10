
import { useAthletePaymentData, useAthleteBranchData, useAthleteScores } from '../../hooks/useAthleteData';
import { useBateriaData } from '../../tabs/scores/hooks/useBateriaData';
import { useBateriaScores } from '../../score-card/components/bateria-scores/hooks/useBateriaScores';

interface UseAthleteCardDataProps {
  athleteId: string;
  modalityId?: number;
  eventId?: string | null;
}

export function useAthleteCardData({ athleteId, modalityId, eventId }: UseAthleteCardDataProps) {
  // Fetch athlete data using custom hooks
  const { data: paymentData, isLoading: isLoadingPayment } = useAthletePaymentData(athleteId, eventId);
  const { data: branchData, isLoading: isLoadingBranch } = useAthleteBranchData(athleteId);
  const { data: scores } = useAthleteScores(athleteId);
  
  // Get bateria data and scores for closed card display
  const { data: bateriasData = [] } = useBateriaData(modalityId, eventId);
  const { batteriaScores = [] } = useBateriaScores({
    athleteId,
    modalityId: modalityId || 0,
    eventId: eventId || '',
    baterias: bateriasData
  });

  // Check if the athlete has a score for the selected modality
  const hasScoreForCurrentModality = modalityId ? 
    scores?.some(score => score.modalidade_id === modalityId) : 
    false;

  // Get athlete identifier from payment data or fallback to ID slice
  const athleteIdentifier = paymentData?.numero_identificador || athleteId.slice(-6);

  return {
    paymentData,
    branchData,
    scores,
    bateriasData,
    batteriaScores,
    hasScoreForCurrentModality,
    athleteIdentifier,
    isLoadingPayment,
    isLoadingBranch
  };
}
