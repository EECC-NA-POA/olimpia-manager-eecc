
import { useScoreMutation } from '../../score-card/components/bateria-scores/hooks/useScoreMutation';

interface UseScoreHandlingProps {
  athleteId: string;
  modalityId?: number;
  eventId?: string | null;
  judgeId?: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
}

export function useScoreHandling({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId, 
  scoreType = 'pontos' 
}: UseScoreHandlingProps) {
  // Score mutation for quick editing
  const { updateScoreMutation } = useScoreMutation({
    athleteId,
    modalityId: modalityId || 0,
    eventId: eventId || '',
    judgeId: judgeId || ''
  });

  const handleScoreUpdate = (scoreId: number, newValue: string) => {
    let processedValue: any = newValue;
    
    // Convert empty string to null
    if (processedValue === '') {
      processedValue = null;
    } else if (scoreType === 'distancia') {
      processedValue = parseFloat(newValue);
    } else if (scoreType === 'pontos') {
      processedValue = parseFloat(newValue);
    } else if (scoreType === 'tempo') {
      processedValue = parseInt(newValue);
    }

    updateScoreMutation.mutate({
      scoreId,
      newValues: { valor_pontuacao: processedValue }
    });
  };

  return {
    handleScoreUpdate,
    updateScoreMutation
  };
}
