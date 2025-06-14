
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { DynamicTableHeader } from './DynamicTableHeader';
import { AthleteTableRow } from './AthleteTableRow';

interface DynamicScoringTableContentProps {
  athletes: Athlete[];
  campos: CampoModelo[];
  selectedBateriaId?: number | null;
  editingAthletes: Set<string>;
  editValues: Record<string, any>;
  unsavedChanges: Set<string>;
  existingScores: any[];
  isSaving: boolean;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
  onFieldChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  getFieldValue: (athleteId: string, fieldKey: string) => string | number;
  getDisplayValue: (athleteId: string, fieldKey: string) => string;
  hasExistingScore: (athleteId: string) => boolean;
}

export function DynamicScoringTableContent({
  athletes,
  campos,
  selectedBateriaId,
  editingAthletes,
  editValues,
  unsavedChanges,
  existingScores,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  hasExistingScore
}: DynamicScoringTableContentProps) {
  const [selectedUnscored, setSelectedUnscored] = React.useState<Set<string>>(new Set());

  // Separate athletes into scored and unscored for the selected bateria
  const { scoredAthletes, unscoredAthletes } = React.useMemo(() => {
    if (!selectedBateriaId) {
      // If no bateria selected, show all athletes normally
      const scored = athletes.filter(athlete => hasExistingScore(athlete.atleta_id));
      const unscored = athletes.filter(athlete => !hasExistingScore(athlete.atleta_id));
      
      return {
        scoredAthletes: [...scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))],
        unscoredAthletes: [...unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))]
      };
    }

    // For bateria system, separate based on scores in this specific bateria
    const scored = athletes.filter(athlete => {
      return existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
    });
    
    const unscored = athletes.filter(athlete => {
      return !existingScores.some(score => 
        score.atleta_id === athlete.atleta_id && score.numero_bateria === selectedBateriaId
      );
    });

    return {
      scoredAthletes: scored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome)),
      unscoredAthletes: unscored.sort((a, b) => a.atleta_nome.localeCompare(b.atleta_nome))
    };
  }, [athletes, selectedBateriaId, existingScores, hasExistingScore]);

  const handleUnscoredSelection = (athleteId: string, checked: boolean) => {
    const newSelected = new Set(selectedUnscored);
    if (checked) {
      newSelected.add(athleteId);
    } else {
      newSelected.delete(athleteId);
    }
    setSelectedUnscored(newSelected);
  };

  const handleAddSelectedToTable = () => {
    // Clear the selection - the athletes will now appear in the main table
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
    <div className="space-y-4">
      {/* Main scoring table */}
      <div className="border rounded-lg overflow-hidden">
        {selectedBateriaId && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="text-blue-800 text-sm font-medium">
              Sistema de Baterias Ativo - Bateria {getBateriaDisplayName(selectedBateriaId)}
            </div>
            <div className="text-blue-700 text-xs mt-1">
              Pontuações serão registradas para a bateria selecionada
            </div>
          </div>
        )}
        
        <Table>
          <DynamicTableHeader campos={campos} />
          <TableBody>
            {mainTableAthletes.map((athlete) => {
              const isEditing = editingAthletes.has(athlete.atleta_id);
              const athleteHasScore = hasExistingScore(athlete.atleta_id);
              
              return (
                <AthleteTableRow
                  key={athlete.atleta_id}
                  athlete={athlete}
                  campos={campos}
                  isEditing={isEditing}
                  athleteHasScore={athleteHasScore}
                  hasUnsavedChanges={unsavedChanges.has(athlete.atleta_id)}
                  editValues={editValues}
                  selectedBateriaId={selectedBateriaId}
                  onEdit={onEdit}
                  onSave={onSave}
                  onCancel={onCancel}
                  onFieldChange={onFieldChange}
                  getFieldValue={getFieldValue}
                  getDisplayValue={getDisplayValue}
                  isSaving={isSaving}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
