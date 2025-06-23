
import { useState, useEffect } from 'react';
import { Athlete } from './useAthletes';

interface UseBateriaAthleteSelectionProps {
  athletes: Athlete[];
  selectedBateriaId: number | null;
}

export function useBateriaAthleteSelection({
  athletes,
  selectedBateriaId
}: UseBateriaAthleteSelectionProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());

  // Reset selection when bateria changes
  useEffect(() => {
    if (selectedBateriaId) {
      console.log('Resetting athlete selection for bateria:', selectedBateriaId);
      setSelectedAthletes(new Set());
    }
  }, [selectedBateriaId]);

  const handleAthleteToggle = (athleteId: string) => {
    console.log('Toggling athlete:', athleteId, 'Current selection size:', selectedAthletes.size);
    setSelectedAthletes(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(athleteId)) {
        newSelected.delete(athleteId);
        console.log('Removed athlete from selection');
      } else {
        newSelected.add(athleteId);
        console.log('Added athlete to selection');
      }
      console.log('New selection size:', newSelected.size);
      return newSelected;
    });
  };

  const handleSelectAll = (filteredAthletes: Athlete[]) => {
    console.log('Selecting all filtered athletes:', filteredAthletes.length);
    const allIds = new Set(filteredAthletes.map(a => a.atleta_id));
    setSelectedAthletes(allIds);
  };

  const handleClearAll = () => {
    console.log('Clearing all selections');
    setSelectedAthletes(new Set());
  };

  const getSelectedAthletesList = () => {
    return athletes.filter(athlete => selectedAthletes.has(athlete.atleta_id));
  };

  const getFilteredAthletes = (allFilteredAthletes: Athlete[]) => {
    if (selectedBateriaId && selectedAthletes.size > 0) {
      return allFilteredAthletes.filter(athlete => 
        selectedAthletes.has(athlete.atleta_id)
      );
    }
    return allFilteredAthletes;
  };

  return {
    selectedAthletes,
    selectedAthletesList: getSelectedAthletesList(),
    handleAthleteToggle,
    handleSelectAll,
    handleClearAll,
    getFilteredAthletes
  };
}
