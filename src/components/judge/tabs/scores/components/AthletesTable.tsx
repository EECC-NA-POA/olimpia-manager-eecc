
import React from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { ScoreTableHeader } from './ScoreTableHeader';
import { ScoreEntryRow } from './ScoreEntryRow';
import { useScoreEntries } from './hooks/useScoreEntries';
import { useScoreSubmission } from './hooks/useScoreSubmission';

interface AthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function AthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule
}: AthletesTableProps) {
  const {
    scoreEntries,
    startEditing,
    cancelEditing,
    updateEntry,
    validateEntry,
    formatScoreValue
  } = useScoreEntries();

  const { submitScoreMutation } = useScoreSubmission();

  // Fetch existing scores
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-scores', modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .in('atleta_id', athletes.map(a => a.atleta_id));
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!eventId && athletes.length > 0,
  });

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
      });
      cancelEditing(athleteId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <ScoreTableHeader scoreType={scoreType} />
          <TableBody>
            {athletes.map((athlete) => {
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
                  formatScoreValue={formatScoreValue}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      {athletes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum atleta inscrito nesta modalidade</p>
        </div>
      )}
    </div>
  );
}
