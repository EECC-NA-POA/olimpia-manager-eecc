
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, Check, X, MessageSquare } from 'lucide-react';
import { Athlete } from '../hooks/useAthletes';

interface ScoreEntry {
  athleteId: string;
  value: string;
  notes: string;
  isEditing: boolean;
}

interface ScoreEntryRowProps {
  athlete: Athlete;
  existingScore?: any;
  scoreEntry?: ScoreEntry;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  isSubmitting: boolean;
  onStartEditing: (athleteId: string) => void;
  onCancelEditing: (athleteId: string) => void;
  onSaveScore: (athleteId: string) => void;
  onUpdateEntry: (athleteId: string, field: keyof ScoreEntry, value: string) => void;
  onOpenNotesDialog: (athlete: Athlete) => void;
  formatScoreValue: (value: number, type: string) => string;
  selectedBateriaId?: number | null;
}

export function ScoreEntryRow({
  athlete,
  existingScore,
  scoreEntry,
  scoreType,
  isSubmitting,
  onStartEditing,
  onCancelEditing,
  onSaveScore,
  onUpdateEntry,
  onOpenNotesDialog,
  formatScoreValue,
  selectedBateriaId
}: ScoreEntryRowProps) {
  const isEditing = scoreEntry?.isEditing || false;

  // Determine the bateria display
  const getBateriaDisplay = () => {
    if (!selectedBateriaId) return '-';
    
    if (selectedBateriaId === 999) {
      return 'Final';
    }
    
    return selectedBateriaId.toString();
  };

  return (
    <TableRow key={athlete.atleta_id}>
      <TableCell className="font-medium">
        {athlete.atleta_nome}
      </TableCell>
      <TableCell>
        {athlete.filial_nome || '-'}
      </TableCell>
      <TableCell>
        <Badge variant={selectedBateriaId === 999 ? "default" : "secondary"}>
          {getBateriaDisplay()}
        </Badge>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={scoreEntry.value}
            onChange={(e) => onUpdateEntry(athlete.atleta_id, 'value', e.target.value)}
            placeholder={scoreType === 'tempo' ? '00:30.000' : '0'}
            className="w-32"
          />
        ) : (
          <span className={existingScore ? 'font-medium' : 'text-muted-foreground'}>
            {existingScore 
              ? formatScoreValue(existingScore.valor_pontuacao, scoreType)
              : 'Não avaliado'
            }
          </span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Textarea
            value={scoreEntry.notes}
            onChange={(e) => onUpdateEntry(athlete.atleta_id, 'notes', e.target.value)}
            placeholder="Observações..."
            className="w-48 h-8 resize-none"
            rows={1}
          />
        ) : (
          <span className="text-sm text-muted-foreground">
            {existingScore?.observacoes || '-'}
          </span>
        )}
      </TableCell>
      <TableCell>
        {existingScore ? (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            Avaliado
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            Pendente
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSaveScore(athlete.atleta_id)}
                disabled={isSubmitting}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancelEditing(athlete.atleta_id)}
                disabled={isSubmitting}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartEditing(athlete.atleta_id)}
              className="h-8 w-8 p-0"
            >
              {existingScore ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenNotesDialog(athlete)}
            className="h-8 w-8 p-0"
            title="Adicionar observações"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
