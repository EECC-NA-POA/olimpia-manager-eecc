import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { DynamicInputField } from './DynamicInputField';
import { AthleteStatusCell } from './AthleteStatusCell';
import { AthleteActionButtons } from './AthleteActionButtons';

interface AthleteTableRowProps {
  athlete: Athlete;
  campos: CampoModelo[];
  isEditing: boolean;
  athleteHasScore: boolean;
  hasUnsavedChanges: boolean;
  editValues: Record<string, any>;
  selectedBateriaId?: number | null;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
  onFieldChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  getFieldValue: (athleteId: string, fieldKey: string) => string | number;
  getDisplayValue: (athleteId: string, fieldKey: string) => string;
  isSaving: boolean;
}

export function AthleteTableRow({
  athlete,
  campos,
  isEditing,
  athleteHasScore,
  hasUnsavedChanges,
  selectedBateriaId,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  isSaving
}: AthleteTableRowProps) {
  return (
    <TableRow key={athlete.atleta_id}>
      <TableCell>
        <div className="font-medium">{athlete.atleta_nome}</div>
        <div className="text-sm text-muted-foreground">
          {athlete.tipo_documento}: {athlete.numero_documento}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {athlete.filial_nome || athlete.equipe_nome || 'N/A'}
        </div>
        {athlete.origem_cidade && (
          <div className="text-xs text-muted-foreground">
            {athlete.origem_cidade}
            {athlete.origem_uf && ` - ${athlete.origem_uf}`}
          </div>
        )}
      </TableCell>
      {campos.map((campo) => {
        if (campo.tipo_input === 'calculated') {
          return (
            <TableCell key={campo.chave_campo} className="text-center">
              <span className="text-sm text-muted-foreground">
                Calculado automaticamente
              </span>
            </TableCell>
          );
        }
        
        return (
          <TableCell key={campo.chave_campo} className="text-center">
            {(isEditing || !athleteHasScore) ? (
              <DynamicInputField
                athleteId={athlete.atleta_id}
                campo={campo}
                value={getFieldValue(athlete.atleta_id, campo.chave_campo)}
                onChange={(value) => {
                  console.log(`Field change: ${athlete.atleta_id}.${campo.chave_campo} = ${value}`);
                  onFieldChange(athlete.atleta_id, campo.chave_campo, value);
                }}
                selectedBateriaId={selectedBateriaId}
              />
            ) : (
              <span className="text-sm">
                {getDisplayValue(athlete.atleta_id, campo.chave_campo)}
              </span>
            )}
          </TableCell>
        );
      })}
      <AthleteStatusCell hasUnsavedChanges={hasUnsavedChanges} />
      <TableCell>
        <AthleteActionButtons
          athleteId={athlete.atleta_id}
          isEditing={isEditing}
          athleteHasScore={athleteHasScore}
          isSaving={isSaving}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      </TableCell>
    </TableRow>
  );
}
