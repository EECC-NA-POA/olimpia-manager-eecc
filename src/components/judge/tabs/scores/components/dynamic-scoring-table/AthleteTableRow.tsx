
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, Edit, Trash2 } from 'lucide-react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';
import { DynamicInputField } from './DynamicInputField';

interface AthleteTableRowProps {
  athlete: Athlete;
  campos: CampoModelo[];
  isEditing: boolean;
  athleteHasScore: boolean;
  hasUnsavedChanges: boolean;
  editValues: Record<string, any>;
  selectedBateriaId?: number | null;
  athleteIndex?: number;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
  onFieldChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  getFieldValue: (athleteId: string, fieldKey: string) => string | number;
  getDisplayValue: (athleteId: string, fieldKey: string) => string;
  isSaving: boolean;
  canRemove?: boolean;
  onRemove?: (athleteId: string) => void;
  onDeleteScores?: (athleteId: string) => void;
}

export function AthleteTableRow({
  athlete,
  campos,
  isEditing,
  athleteHasScore,
  hasUnsavedChanges,
  editValues,
  selectedBateriaId,
  athleteIndex = 0,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  isSaving,
  canRemove = false,
  onRemove,
  onDeleteScores
}: AthleteTableRowProps) {
  // CRITICAL: Filter out configuration fields before rendering
  const scoringFields = filterScoringFields(campos);
  
  console.log('AthleteTableRow - Filtering fields for athlete:', athlete.atleta_nome, {
    originalCount: campos.length,
    filteredCount: scoringFields.length,
    athleteIndex,
    selectedBateriaId,
    athleteHasScore,
    isEditing
  });

  const renderFieldInput = (campo: CampoModelo) => {
    const fieldKey = campo.chave_campo;
    const currentValue = getFieldValue(athlete.atleta_id, fieldKey);
    
    console.log(`Rendering input for ${athlete.atleta_nome} - ${fieldKey}:`, currentValue);

    // Use the DynamicInputField component for consistent behavior
    return (
      <DynamicInputField
        campo={campo}
        athleteId={athlete.atleta_id}
        value={currentValue}
        onChange={(value) => onFieldChange(athlete.atleta_id, fieldKey, value)}
        selectedBateriaId={selectedBateriaId}
        athleteIndex={athleteIndex}
      />
    );
  };

  const renderDisplayValue = (campo: CampoModelo) => {
    const fieldKey = campo.chave_campo;
    const currentValue = getFieldValue(athlete.atleta_id, fieldKey);
    
    console.log(`Rendering display for ${athlete.atleta_nome} - ${fieldKey}:`, currentValue);
    
    // Special handling for calculated fields
    if (campo.tipo_input === 'calculated') {
      const displayValue = currentValue || '-';
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {displayValue}
        </Badge>
      );
    }
    
    // Special handling for bateria field to show the selected bateria number or saved value
    if ((campo.chave_campo === 'bateria' || campo.chave_campo === 'numero_bateria')) {
      let displayValue: string;
      
      if (currentValue) {
        // Use saved value
        displayValue = currentValue === '999' || currentValue === 999 ? 'Final' : currentValue.toString();
      } else if (selectedBateriaId) {
        // Fallback to selected bateria
        displayValue = selectedBateriaId === 999 ? 'Final' : selectedBateriaId.toString();
      } else {
        displayValue = '-';
      }
      
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {displayValue}
        </Badge>
      );
    }
    
    const displayValue = getDisplayValue(athlete.atleta_id, fieldKey);
    return <div className="text-sm font-medium">{displayValue || '-'}</div>;
  };

  return (
    <TableRow className={hasUnsavedChanges ? 'bg-yellow-50' : ''}>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-sm">{athlete.atleta_nome}</div>
          <div className="text-xs text-muted-foreground">
            {athlete.tipo_documento}: {athlete.numero_documento}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">{athlete.filial_nome || 'N/A'}</div>
        {athlete.origem_uf && (
          <div className="text-xs text-muted-foreground">{athlete.origem_uf}</div>
        )}
      </TableCell>
      
      {scoringFields.map((campo) => (
        <TableCell key={campo.id} className="text-center">
          {isEditing ? (
            renderFieldInput(campo)
          ) : (
            renderDisplayValue(campo)
          )}
        </TableCell>
      ))}
      
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={() => onSave(athlete.atleta_id)}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(athlete.atleta_id)}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={athleteHasScore ? "outline" : "default"}
                onClick={() => onEdit(athlete.atleta_id)}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4 mr-1" />
                {athleteHasScore ? 'Editar' : 'Pontuar'}
              </Button>
              {athleteHasScore && (
                <>
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    Avaliado
                  </Badge>
                  {onDeleteScores && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteScores(athlete.atleta_id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remover pontuações do atleta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </TableCell>
      
      {canRemove && onRemove && (
        <TableCell className="text-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(athlete.atleta_id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Remover atleta da tabela"
          >
            <X className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
