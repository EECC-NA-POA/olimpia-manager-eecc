
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save } from 'lucide-react';

interface AthleteStatusCellProps {
  athleteId: string;
  athleteName: string;
  completionStatus: {
    completed: number;
    total: number;
    isComplete: boolean;
  };
  hasUnsavedChanges: boolean;
  onSave: (athleteId: string) => void;
  isSaving: boolean;
}

export function AthleteStatusCell({
  athleteId,
  athleteName,
  completionStatus,
  hasUnsavedChanges,
  onSave,
  isSaving
}: AthleteStatusCellProps) {
  return (
    <>
      <td className="p-4 align-middle">
        <div className="flex flex-col gap-1">
          {completionStatus.isComplete ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              {completionStatus.completed}/{completionStatus.total}
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-800 text-xs">
              Não salvo
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4 align-middle">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSave(athleteId)}
          disabled={!hasUnsavedChanges || isSaving}
        >
          <Save className="h-4 w-4" />
        </Button>
      </td>
    </>
  );
}
