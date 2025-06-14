
import React, { useState } from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { ScoreTableHeader } from './ScoreTableHeader';
import { ScoreEntryRow } from './ScoreEntryRow';
import { AthleteNotesDialog } from './AthleteNotesDialog';
import { useScoreEntries } from './hooks/useScoreEntries';
import { useScoreSubmission } from './hooks/useScoreSubmission';
import { Plus, Users } from 'lucide-react';

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

    // For bateria system, separate based on scores in this specific bateria
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

  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
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
        <div className="border rounded-md">
          <Table>
            <ScoreTableHeader scoreType={scoreType} />
            <TableBody>
              {mainTableAthletes.map((athlete) => {
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

        {mainTableAthletes.length === 0 && unscoredSectionAthletes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedBateriaId 
                ? `Nenhum atleta disponível para a bateria ${getBateriaDisplayName(selectedBateriaId)}`
                : 'Nenhum atleta inscrito nesta modalidade'
              }
            </p>
          </div>
        )}

        {/* Unscored athletes section - only show if there are unscored athletes and a bateria is selected */}
        {selectedBateriaId && unscoredSectionAthletes.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Atletas sem pontuação na bateria {getBateriaDisplayName(selectedBateriaId)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione os atletas que deseja adicionar à tabela de pontuação:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Bulk selection controls */}
                <div className="flex gap-2 pb-3 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllUnscored}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Selecionar todos ({unscoredSectionAthletes.length})
                  </Button>
                  {selectedUnscored.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAllUnscored}
                    >
                      Desmarcar todos
                    </Button>
                  )}
                </div>

                {unscoredSectionAthletes.map((athlete) => (
                  <div key={athlete.atleta_id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedUnscored.has(athlete.atleta_id)}
                      onCheckedChange={(checked) => 
                        handleUnscoredSelection(athlete.atleta_id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium">{athlete.atleta_nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {athlete.tipo_documento}: {athlete.numero_documento} | {athlete.filial_nome || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedUnscored.size > 0 && (
                  <div className="pt-3 border-t">
                    <Button 
                      onClick={handleAddSelectedToTable}
                      className="w-full"
                    >
                      Adicionar {selectedUnscored.size} atleta(s) à tabela de pontuação
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
