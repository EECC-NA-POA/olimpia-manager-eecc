
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Edit, UserMinus } from 'lucide-react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';

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
  canRemove?: boolean;
  onRemove?: (athleteId: string) => void;
}

export function AthleteTableRow({
  athlete,
  campos,
  isEditing,
  athleteHasScore,
  hasUnsavedChanges,
  editValues,
  selectedBateriaId,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  isSaving,
  canRemove = false,
  onRemove
}: AthleteTableRowProps) {
  const renderFieldInput = (campo: CampoModelo) => {
    const fieldKey = campo.chave_campo;
    const currentValue = getFieldValue(athlete.atleta_id, fieldKey);

    if (campo.tipo_input === 'select' && campo.metadados?.opcoes) {
      const options = campo.metadados.opcoes;
      
      return (
        <Select
          value={currentValue?.toString() || ''}
          onValueChange={(value) => onFieldChange(athlete.atleta_id, fieldKey, value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={campo.tipo_input === 'number' || campo.tipo_input === 'integer' ? 'number' : 'text'}
        value={currentValue?.toString() || ''}
        onChange={(e) => {
          const value = (campo.tipo_input === 'number' || campo.tipo_input === 'integer') ? 
            (e.target.value === '' ? '' : Number(e.target.value)) : 
            e.target.value;
          onFieldChange(athlete.atleta_id, fieldKey, value);
        }}
        className="h-8"
        placeholder={`Digite ${campo.rotulo_campo.toLowerCase()}`}
        step={campo.tipo_input === 'number' ? 'any' : undefined}
      />
    );
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
      
      {campos.map((campo) => (
        <TableCell key={campo.id} className="text-center">
          {isEditing ? (
            renderFieldInput(campo)
          ) : (
            <div className="text-sm">
              {getDisplayValue(athlete.atleta_id, campo.chave_campo) || '-'}
            </div>
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
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  Avaliado
                </Badge>
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
            <UserMinus className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
