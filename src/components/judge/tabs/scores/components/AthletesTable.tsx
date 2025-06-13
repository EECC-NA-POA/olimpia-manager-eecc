
import React, { useState } from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { ScoreTableHeader } from './ScoreTableHeader';
import { ScoreEntryRow } from './ScoreEntryRow';
import { AthleteNotesDialog } from './AthleteNotesDialog';
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

  const {
    scoreEntries,
    startEditing,
    cancelEditing,
    updateEntry,
    validateEntry,
    formatScoreValue
  } = useScoreEntries();

  const { submitScoreMutation } = useScoreSubmission();

  // Fetch existing scores (filtered by bateria if selected)
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

      // Filter by bateria if selected
      if (selectedBateriaId) {
        query = query.eq('numero_bateria', selectedBateriaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      console.log('Existing scores for bateria', selectedBateriaId, ':', data);
      return data || [];
    },
    enabled: !!eventId && athletes.length > 0,
  });

  // Filter athletes based on bateria selection
  const filteredAthletes = React.useMemo(() => {
    if (!selectedBateriaId) {
      return athletes;
    }

    // For bateria system, only show athletes who have scores in this bateria
    // OR athletes who don't have any scores yet (so they can be scored for this bateria)
    return athletes.filter(athlete => {
      const hasScoreInThisBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
      
      const hasScoreInAnyBateria = existingScores.some(score => 
        score.atleta_id === athlete.atleta_id
      );

      // Show athlete if they have a score in this bateria OR they don't have any scores yet
      return hasScoreInThisBateria || !hasScoreInAnyBateria;
    });
  }, [athletes, selectedBateriaId, existingScores]);

  console.log('Filtered athletes for bateria', selectedBateriaId, ':', filteredAthletes.length);

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
        bateriaId: selectedBateriaId
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

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-md">
          <Table>
            <ScoreTableHeader scoreType={scoreType} />
            <TableBody>
              {filteredAthletes.map((athlete) => {
                const existingScore = existingScores.find(s => s.atleta_id === athlete.atleta_id);
                const entry = scoreEntries[athlete.atleta_id];

                return (
                  <ScoreEntryRow
                    key={athlete.atleta_id}
                    athlete={athlete}
                    existingScore={existingScore}
                    scoreEntry={entry}
                    scoreType={scoreType}
                    isSubmitting={submitScoreMutation.isPending}
                    onStartEditing={handleStartEditing}
                    onCancelEditing={cancelEditing}
                    onSaveScore={handleSaveScore}
                    onUpdateEntry={updateEntry}
                    onOpenNotesDialog={handleOpenNotesDialog}
                    formatScoreValue={formatScoreValue}
                    selectedBateriaId={selectedBateriaId}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedBateriaId 
                ? 'Nenhum atleta disponível para esta bateria'
                : 'Nenhum atleta inscrito nesta modalidade'
              }
            </p>
          </div>
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
