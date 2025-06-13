
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Edit2 } from 'lucide-react';

interface AthleteActionButtonsProps {
  athleteId: string;
  isEditing: boolean;
  athleteHasScore: boolean;
  isSaving: boolean;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
}

export function AthleteActionButtons({
  athleteId,
  isEditing,
  athleteHasScore,
  isSaving,
  onEdit,
  onSave,
  onCancel
}: AthleteActionButtonsProps) {
  return (
    <div className="flex gap-1">
      {(isEditing || !athleteHasScore) ? (
        <>
          <Button
            size="sm"
            onClick={() => onSave(athleteId)}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <Save className="h-3 w-3" />
          </Button>
          {athleteHasScore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(athleteId)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(athleteId)}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
