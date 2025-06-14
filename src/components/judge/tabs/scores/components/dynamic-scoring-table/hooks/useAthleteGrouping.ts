
import React from 'react';
import { Athlete } from '../../../hooks/useAthletes';

interface UseAthleteGroupingProps {
  athletes: Athlete[];
  selectedBateriaId?: number | null;
  existingScores: any[];
  hasExistingScore: (athleteId: string) => boolean;
  selectedUnscored: Set<string>;
}

export function useAthleteGrouping({
  athletes,
  selectedBateriaId,
  existingScores,
  hasExistingScore,
  selectedUnscored
}: UseAthleteGroupingProps) {
  const athleteGroups = React.useMemo(() => {
    if (!selectedBateriaId) {
      // If no bateria selected, show all athletes normally
      const scored = athletes.filter(athlete => hasExistingScore(athlete.atleta_id));
      const unscored = athletes.filter(athlete => !hasExistingScore(athlete.atleta_id));
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    // For bateria system, separate based on scores in this specific bateria
    const scored = athletes.filter(athlete => {
      return existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
    });
    
    const unscored = athletes.filter(athlete => {
      return !existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
    });

    return {
      scoredAthletes: scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome)),
      unscoredAthletes: unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))
    };
  }, [athletes, selectedBateriaId, existingScores, hasExistingScore]);

  // Athletes to show in the main table (scored + selected unscored)
  const mainTableAthletes = [
    ...athleteGroups.scoredAthletes,
    ...athleteGroups.unscoredAthletes.filter(athlete => selectedUnscored.has(athlete.atleta_id))
  ];

  // Athletes to show in the unscored section (unscored - selected)
  const unscoredSectionAthletes = athleteGroups.unscoredAthletes.filter(
    athlete => !selectedUnscored.has(athlete.atleta_id)
  );

  return {
    mainTableAthletes,
    unscoredSectionAthletes
  };
}
