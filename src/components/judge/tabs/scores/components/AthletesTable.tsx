import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { AthleteNotesDialog } from './AthleteNotesDialog';
import { MainScoringTable } from './MainScoringTable';
import { UnscoredAthletesSection } from './UnscoredAthletesSection';
import { EmptyAthletesList } from './EmptyAthletesList';
import { useScoreEntries } from './hooks/useScoreEntries';
import { useScoreSubmission } from './hooks/useScoreSubmission';

interface AthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
  selectedBateriaId?: number | null;
}

export function AthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule,
  selectedBateriaId
}: AthletesTableProps) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedAthleteForNotes, setSelectedAthleteForNotes] = useState<Athlete | null>(null);
  const [selectedUnscored, setSelectedUnscored] = useState<Set<string>>(new Set());

  const {
    scoreEntries,
    startEditing,
    cancelEditing,
    updateEntry,
    validateEntry,
    formatScoreValue
  } = useScoreEntries();

  const { submitScoreMutation } = useScoreSubmission();

  // Fetch existing scores (filtered by numero_bateria if selected) - FIXED: usar numero_bateria
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-scores', modalityId, eventId, selectedBateriaId],
    queryFn: async () => {
      if (!eventId) return [];
      
      let query = supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .in('atleta_id', athletes.map(a => a.atleta_id));

      // Filter by numero_bateria if selected - FIXED: usar numero_bateria
      if (selectedBateriaId) {
        query = query.eq('numero_bateria', selectedBateriaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      console.log('Existing scores for numero_bateria', selectedBateriaId, ':', data);
      return data || [];
    },
    enabled: !!eventId && athletes.length > 0,
  });

  // Separate athletes into scored and unscored for the selected bateria
  const { scoredAthletes, unscoredAthletes } = React.useMemo(() => {
    if (!selectedBateriaId) {
      // If no bateria selected, show all athletes normally
      const scored = athletes.filter(athlete => 
        existingScores.some(score => score.atleta_id === athlete.atleta_id)
      );
      const unscored = athletes.filter(athlete => 
        !existingScores.some(score => score.atleta_id === athlete.atleta_id)
      );
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    // For bateria system, separate based on scores in this specific bateria using numero_bateria
    const scored = athletes.filter(athlete => 
      existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      )
    );
    
    const unscored = athletes.filter(athlete => 
      !existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      )
    );

    return {
      scoredAthletes: scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome)),
      unscoredAthletes: unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))
    };
  }, [athletes, selectedBateriaId, existingScores]);

  const handleStartEditing = (athleteId: string) => {
    startEditing(athleteId, existingScores);
  };

  const handleSaveScore = async (athleteId: string) => {
    if (!validateEntry(athleteId)) return;

    const entry = scoreEntries[athleteId];
    try {
      await submitScoreMutation.mutateAsync({
        athleteId,
        value: entry.value,
        notes: entry.notes,
        athletes,
        modalityId,
        eventId: eventId!,
        judgeId,
        scoreType,
        numeroBateria: selectedBateriaId
      });
      cancelEditing(athleteId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleOpenNotesDialog = (athlete: Athlete) => {
    setSelectedAthleteForNotes(athlete);
    setNotesDialogOpen(true);
  };

  const getAthleteNotes = (athleteId: string) => {
    const score = existingScores.find(s => s.atleta_id === athleteId);
    return score?.observacoes || '';
  };

  const handleUnscoredSelection = (athleteId: string, checked: boolean) => {
    const newSelected = new Set(selectedUnscored);
    if (checked) {
      newSelected.add(athleteId);
    } else {
      newSelected.delete(athleteId);
    }
    setSelectedUnscored(newSelected);
  };

  const handleSelectAllUnscored = () => {
    const newSelected = new Set(unscoredSectionAthletes.map(athlete => athlete.atleta_id));
    setSelectedUnscored(newSelected);
  };

  const handleDeselectAllUnscored = () => {
    setSelectedUnscored(new Set());
  };

  const handleAddSelectedToTable = () => {
    // The selected athletes will now appear in the main table
    // Clear the selection
    setSelectedUnscored(new Set());
  };

  // Athletes to show in the main table (scored + selected unscored)
  const mainTableAthletes = [
    ...scoredAthletes,
    ...unscoredAthletes.filter(athlete => selectedUnscored.has(athlete.atleta_id))
  ];

  // Athletes to show in the unscored section (unscored - selected)
  const unscoredSectionAthletes = unscoredAthletes.filter(
    athlete => !selectedUnscored.has(athlete.atleta_id)
  );

  return (
    <>
      <div className="space-y-4">
        {/* Main scoring table */}
        {mainTableAthletes.length > 0 && (
          <MainScoringTable
            athletes={mainTableAthletes}
            existingScores={existingScores}
            scoreEntries={scoreEntries}
            scoreType={scoreType}
            isSubmitting={submitScoreMutation.isPending}
            selectedBateriaId={selectedBateriaId}
            onStartEditing={handleStartEditing}
            onCancelEditing={cancelEditing}
            onSaveScore={handleSaveScore}
            onUpdateEntry={updateEntry}
            onOpenNotesDialog={handleOpenNotesDialog}
            formatScoreValue={formatScoreValue}
          />
        )}

        {/* Empty state */}
        {mainTableAthletes.length === 0 && unscoredSectionAthletes.length === 0 && (
          <EmptyAthletesList selectedBateriaId={selectedBateriaId} />
        )}

        {/* Unscored athletes section - only show if there are unscored athletes and a bateria is selected */}
        {selectedBateriaId && unscoredSectionAthletes.length > 0 && (
          <UnscoredAthletesSection
            athletes={unscoredSectionAthletes}
            selectedBateriaId={selectedBateriaId}
            selectedUnscored={selectedUnscored}
            onUnscoredSelection={handleUnscoredSelection}
            onSelectAllUnscored={handleSelectAllUnscored}
            onDeselectAllUnscored={handleDeselectAllUnscored}
            onAddSelectedToTable={handleAddSelectedToTable}
          />
        )}
      </div>

      {/* Notes Dialog */}
      {selectedAthleteForNotes && (
        <AthleteNotesDialog
          athleteId={selectedAthleteForNotes.atleta_id}
          athleteName={selectedAthleteForNotes.atleta_nome}
          modalityId={modalityId}
          eventId={eventId!}
          currentNotes={getAthleteNotes(selectedAthleteForNotes.atleta_id)}
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
        />
      )}
    </>
  );
}
