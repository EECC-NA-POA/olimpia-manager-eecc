
import React from 'react';
import { Athlete } from '../../../hooks/useAthletes';

interface UseAthleteGroupingProps {
  athletes: Athlete[];
  selectedBateriaId?: number | null;
  existingScores: any[];
  hasExistingScore: (athleteId: string) => boolean;
  selectedUnscored: Set<string>;
  usesBaterias: boolean;
}

export function useAthleteGrouping({
  athletes,
  selectedBateriaId,
  existingScores,
  hasExistingScore,
  selectedUnscored,
  usesBaterias
}: UseAthleteGroupingProps) {
  const athleteGroups = React.useMemo(() => {
    console.log('=== ATHLETE GROUPING DEBUG ===');
    console.log('Total athletes received:', athletes.length);
    console.log('Selected bateria ID:', selectedBateriaId);
    console.log('Existing scores:', existingScores.length);
    console.log('Uses baterias:', usesBaterias);
    
    if (!athletes || athletes.length === 0) {
      console.log('No athletes available');
      return {
        scoredAthletes: [],
        unscoredAthletes: []
      };
    }
    
    if (!usesBaterias) {
      // For non-bateria modalities, group by global scores
      const scored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`No bateria mode - Athlete ${athlete.atleta_nome} has score:`, hasScore);
        return hasScore;
      });
      
      const unscored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`No bateria mode - Athlete ${athlete.atleta_nome} unscored:`, !hasScore);
        return !hasScore;
      });
      
      console.log('No bateria mode - Scored athletes:', scored.length);
      console.log('No bateria mode - Unscored athletes:', unscored.length);
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    if (!selectedBateriaId) {
      // If no bateria selected in bateria mode, show all athletes as unscored
      console.log('No bateria selected - All athletes as unscored');
      
      return {
        scoredAthletes: [],
        unscoredAthletes: [...athletes.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
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
  }, [athletes, selectedBateriaId, existingScores, hasExistingScore, usesBaterias]);

  // Athletes to show in the main table
  const mainTableAthletes = React.useMemo(() => {
    console.log('=== MAIN TABLE ATHLETES CALCULATION ===');
    console.log('usesBaterias:', usesBaterias);
    console.log('athletes.length:', athletes.length);
    console.log('athleteGroups.scoredAthletes.length:', athleteGroups.scoredAthletes.length);
    console.log('athleteGroups.unscoredAthletes.length:', athleteGroups.unscoredAthletes.length);
    console.log('selectedUnscored size:', selectedUnscored.size);
    
    if (!usesBaterias) {
      // For non-bateria modalities, show ALL athletes in main table
      const result = [...athletes].sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome));
      console.log('No bateria mode - Main table athletes count:', result.length);
      console.log('No bateria mode - Athletes:', result.map(a => a.atleta_nome));
      return result;
    }

    // For bateria mode, show scored + selected unscored
    const selectedUnscoredAthletes = athleteGroups.unscoredAthletes.filter(athlete => 
      selectedUnscored.has(athlete.atleta_id)
    );
    
    const result = [
      ...athleteGroups.scoredAthletes,
      ...selectedUnscoredAthletes
    ];
    
    console.log('Bateria mode - Scored athletes:', athleteGroups.scoredAthletes.map(a => a.atleta_nome));
    console.log('Bateria mode - Selected unscored athletes:', selectedUnscoredAthletes.map(a => a.atleta_nome));
    console.log('Bateria mode - Main table athletes count:', result.length);
    console.log('Bateria mode - Final main table athletes:', result.map(a => a.atleta_nome));
    console.log('=== END MAIN TABLE ATHLETES CALCULATION ===');
    
    return result;
  }, [athletes, athleteGroups.scoredAthletes, athleteGroups.unscoredAthletes, selectedUnscored, usesBaterias]);

  // Athletes to show in the unscored section (unscored - selected) - only for bateria mode
  const unscoredSectionAthletes = React.useMemo(() => {
    if (!usesBaterias) {
      // No unscored section for non-bateria modalities
      return [];
    }

    const result = athleteGroups.unscoredAthletes.filter(
      athlete => !selectedUnscored.has(athlete.atleta_id)
    );
    console.log('Unscored section athletes count:', result.length);
    console.log('Unscored section athletes:', result.map(a => a.atleta_nome));
    return result;
  }, [athleteGroups.unscoredAthletes, selectedUnscored, usesBaterias]);

  return {
    mainTableAthletes,
    unscoredSectionAthletes
  };
}
