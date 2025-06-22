
import React from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { Athlete } from '../hooks/useAthletes';
import { ScoreTableHeader } from './ScoreTableHeader';
import { ScoreEntryRow } from './ScoreEntryRow';

interface ScoreEntry {
  athleteId: string;
  value: string;
  notes: string;
  isEditing: boolean;
}

interface MainScoringTableProps {
  athletes: Athlete[];
  existingScores: any[];
  scoreEntries: Record<string, ScoreEntry>;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  isSubmitting: boolean;
  selectedBateriaId?: number | null;
  onStartEditing: (athleteId: string) => void;
  onCancelEditing: (athleteId: string) => void;
  onSaveScore: (athleteId: string) => void;
  onUpdateEntry: (athleteId: string, field: keyof ScoreEntry, value: string) => void;
  onOpenNotesDialog: (athlete: Athlete) => void;
  formatScoreValue: (value: number, type: string) => string;
}

export function MainScoringTable({
  athletes,
  existingScores,
  scoreEntries,
  scoreType,
  isSubmitting,
  selectedBateriaId,
  onStartEditing,
  onCancelEditing,
  onSaveScore,
  onUpdateEntry,
  onOpenNotesDialog,
  formatScoreValue
}: MainScoringTableProps) {
  return (
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
                isSubmitting={isSubmitting}
                onStartEditing={onStartEditing}
                onCancelEditing={onCancelEditing}
                onSaveScore={onSaveScore}
                onUpdateEntry={onUpdateEntry}
                onOpenNotesDialog={onOpenNotesDialog}
                formatScoreValue={formatScoreValue}
                selectedBateriaId={selectedBateriaId}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
