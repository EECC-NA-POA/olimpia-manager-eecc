
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Edit, Trash } from 'lucide-react';
import { ScheduleItem } from '../types';
import { RecurrentActivityRenderer } from './RecurrentActivityRenderer';
import { RecurrentDaysSummary, RecurrentTimesSummary, RecurrentLocationsSummary } from './RecurrentActivitySummary';

interface ScheduleTableRowProps {
  item: ScheduleItem;
  openEditDialog: (item: ScheduleItem) => void;
  handleDelete: (id: number) => void;
  formatDate: (dateStr: string) => string;
}

export const ScheduleTableRow: React.FC<ScheduleTableRowProps> = ({
  item,
  openEditDialog,
  handleDelete,
  formatDate
}) => {
  return (
    <TableRow key={item.id}>
      <TableCell className="align-top">
        <div className="space-y-2">
          <div className="font-medium">{item.atividade}</div>
          <RecurrentActivityRenderer item={item} formatDate={formatDate} />
        </div>
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <RecurrentDaysSummary item={item} />
        ) : (
          formatDate(item.dia)
        )}
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <RecurrentTimesSummary item={item} />
        ) : (
          `${item.horario_inicio} ${item.horario_fim ? `- ${item.horario_fim}` : ''}`
        )}
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <RecurrentLocationsSummary item={item} />
        ) : (
          item.local
        )}
      </TableCell>
      
      <TableCell className="align-top">
        <Badge variant={item.global ? "default" : "secondary"}>
          {item.global ? 'Sim' : 'Não'}
        </Badge>
      </TableCell>
      
      <TableCell className="align-top">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openEditDialog(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
