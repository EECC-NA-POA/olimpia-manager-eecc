
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
    console.log('=== ATHLETE GROUPING DEBUG ===');
    console.log('Total athletes received:', athletes.length);
    console.log('Selected bateria ID:', selectedBateriaId);
    console.log('Existing scores:', existingScores.length);
    
    if (!selectedBateriaId) {
      // If no bateria selected, show all athletes normally
      const scored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`Athlete ${athlete.atleta_nome} has score:`, hasScore);
        return hasScore;
      });
      
      const unscored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`Athlete ${athlete.atleta_nome} unscored:`, !hasScore);
        return !hasScore;
      });
      
      console.log('No bateria - Scored athletes:', scored.length);
      console.log('No bateria - Unscored athletes:', unscored.length);
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    // For bateria system, separate based on scores in this specific bateria
    const scored = athletes.filter(athlete => {
      const hasScoreInBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
      console.log(`Athlete ${athlete.atleta_nome} has score in bateria ${selectedBateriaId}:`, hasScoreInBateria);
      return hasScoreInBateria;
    });
    
    const unscored = athletes.filter(athlete => {
      const hasScoreInBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
      console.log(`Athlete ${athlete.atleta_nome} unscored in bateria ${selectedBateriaId}:`, !hasScoreInBateria);
      return !hasScoreInBateria;
    });

    console.log('Bateria mode - Scored athletes:', scored.length);
    console.log('Bateria mode - Unscored athletes:', unscored.length);
    console.log('=== END ATHLETE GROUPING DEBUG ===');

    return {
      scoredAthletes: scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome)),
      unscoredAthletes: unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))
    };
  }, [athletes, selectedBateriaId, existingScores, hasExistingScore]);

  // Athletes to show in the main table (scored + selected unscored)
  const mainTableAthletes = React.useMemo(() => {
    const result = [
      ...athleteGroups.scoredAthletes,
      ...athleteGroups.unscoredAthletes.filter(athlete => selectedUnscored.has(athlete.atleta_id))
    ];
    console.log('Main table athletes count:', result.length);
    return result;
  }, [athleteGroups.scoredAthletes, athleteGroups.unscoredAthletes, selectedUnscored]);

  // Athletes to show in the unscored section (unscored - selected)
  const unscoredSectionAthletes = React.useMemo(() => {
    const result = athleteGroups.unscoredAthletes.filter(
      athlete => !selectedUnscored.has(athlete.atleta_id)
    );
    console.log('Unscored section athletes count:', result.length);
    return result;
  }, [athleteGroups.unscoredAthletes, selectedUnscored]);

  return {
    mainTableAthletes,
    unscoredSectionAthletes
  };
}
