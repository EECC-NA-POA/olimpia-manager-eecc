
import React from 'react';

export function useAthleteSelection() {
  const [selectedUnscored, setSelectedUnscored] = React.useState<Set<string>>(new Set());

  const handleUnscoredSelection = (athleteId: string, checked: boolean) => {
    const newSelected = new Set(selectedUnscored);
    if (checked) {
      newSelected.add(athleteId);
    } else {
      newSelected.delete(athleteId);
    }
    setSelectedUnscored(newSelected);
  };

  const handleSelectAllUnscored = (athleteIds: string[]) => {
    const newSelected = new Set(athleteIds);
    setSelectedUnscored(newSelected);
  };

  const handleDeselectAllUnscored = () => {
    setSelectedUnscored(new Set());
  };

  const handleAddSelectedToTable = () => {
    // Clear the selection - the athletes will now appear in the main table
    setSelectedUnscored(new Set());
  };

  const handleRemoveAthleteFromTable = (athleteId: string) => {
    // Remove athlete from main table by deselecting them
    const newSelected = new Set(selectedUnscored);
    newSelected.delete(athleteId);
    setSelectedUnscored(newSelected);
  };

  return {
    selectedUnscored,
    handleUnscoredSelection,
    handleSelectAllUnscored,
    handleDeselectAllUnscored,
    handleAddSelectedToTable,
    handleRemoveAthleteFromTable
  };
}
