
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface AthleteStatusCellProps {
  hasUnsavedChanges: boolean;
}

export function AthleteStatusCell({ hasUnsavedChanges }: AthleteStatusCellProps) {
  return (
    <TableCell>
      <div className="flex flex-col gap-1">
        {hasUnsavedChanges ? (
          <Badge variant="outline" className="bg-orange-50 text-orange-800 text-xs">
            Não salvo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
            Salvo
          </Badge>
        )}
      </div>
    </TableCell>
  );
}
