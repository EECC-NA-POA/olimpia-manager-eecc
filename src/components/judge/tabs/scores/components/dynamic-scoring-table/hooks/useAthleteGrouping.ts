
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
    console.log('Input parameters:', {
      athletesCount: athletes.length,
      selectedBateriaId,
      existingScoresCount: existingScores.length,
      selectedUnscoredSize: selectedUnscored.size,
      usesBaterias
    });
    console.log('Athletes received:', athletes.map(a => ({ id: a.atleta_id, nome: a.atleta_nome })));
    console.log('Existing scores:', existingScores);
    
    if (!athletes || athletes.length === 0) {
      console.log('No athletes available for grouping');
      return {
        scoredAthletes: [],
        unscoredAthletes: []
      };
    }
    
    if (!usesBaterias) {
      // For non-bateria modalities, group by global scores
      console.log('Processing non-bateria modality...');
      
      const scored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`No bateria mode - Athlete ${athlete.atleta_nome} (${athlete.atleta_id}) has score:`, hasScore);
        return hasScore;
      });
      
      const unscored = athletes.filter(athlete => {
        const hasScore = hasExistingScore(athlete.atleta_id);
        console.log(`No bateria mode - Athlete ${athlete.atleta_nome} (${athlete.atleta_id}) unscored:`, !hasScore);
        return !hasScore;
      });
      
      console.log('No bateria mode results:', {
        scored: scored.length,
        unscored: unscored.length,
        scoredAthletes: scored.map(a => a.atleta_nome),
        unscoredAthletes: unscored.map(a => a.atleta_nome)
      });
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    if (!selectedBateriaId) {
      // If no bateria selected in bateria mode, show all athletes as unscored
      console.log('Bateria mode but no bateria selected - All athletes as unscored');
      
      return {
        scoredAthletes: [],
        unscoredAthletes: [...athletes.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    // For bateria system, separate based on scores in this specific bateria
    console.log('Processing bateria mode with selected bateria:', selectedBateriaId);
    
    const scored = athletes.filter(athlete => {
      const hasScoreInBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
      console.log(`Athlete ${athlete.atleta_nome} (${athlete.atleta_id}) has score in bateria ${selectedBateriaId}:`, hasScoreInBateria);
      return hasScoreInBateria;
    });
    
    const unscored = athletes.filter(athlete => {
      const hasScoreInBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
      console.log(`Athlete ${athlete.atleta_nome} (${athlete.atleta_id}) unscored in bateria ${selectedBateriaId}:`, !hasScoreInBateria);
      return !hasScoreInBateria;
    });

    console.log('Bateria mode results:', {
      scored: scored.length,
      unscored: unscored.length,
      scoredAthletes: scored.map(a => a.atleta_nome),
      unscoredAthletes: unscored.map(a => a.atleta_nome)
    });
    console.log('=== END ATHLETE GROUPING DEBUG ===');

    return {
      scoredAthletes: scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome)),
      unscoredAthletes: unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))
    };
  }, [athletes, selectedBateriaId, existingScores, hasExistingScore, usesBaterias]);

  // Athletes to show in the main table
  const mainTableAthletes = React.useMemo(() => {
    console.log('=== MAIN TABLE ATHLETES CALCULATION ===');
    console.log('Input data:', {
      usesBaterias,
      athletesLength: athletes.length,
      scoredAthletesLength: athleteGroups.scoredAthletes.length,
      unscoredAthletesLength: athleteGroups.unscoredAthletes.length,
      selectedUnscoredSize: selectedUnscored.size
    });
    
    if (!usesBaterias) {
      // For non-bateria modalities, show ALL athletes in main table
      const result = [...athletes].sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome));
      console.log('No bateria mode - Main table athletes:', {
        count: result.length,
        athletes: result.map(a => a.atleta_nome)
      });
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
    
    console.log('Bateria mode - Main table calculation:', {
      scoredAthletes: athleteGroups.scoredAthletes.map(a => a.atleta_nome),
      selectedUnscoredAthletes: selectedUnscoredAthletes.map(a => a.atleta_nome),
      finalCount: result.length,
      finalAthletes: result.map(a => a.atleta_nome)
    });
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
    console.log('Unscored section athletes:', {
      count: result.length,
      athletes: result.map(a => a.atleta_nome)
    });
    return result;
  }, [athleteGroups.unscoredAthletes, selectedUnscored, usesBaterias]);

  return {
    mainTableAthletes,
    unscoredSectionAthletes
  };
}
