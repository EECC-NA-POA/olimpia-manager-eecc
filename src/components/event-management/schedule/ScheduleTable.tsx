
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash } from 'lucide-react';
import { ScheduleItem } from './types';

interface ScheduleTableProps {
  scheduleItems: ScheduleItem[];
  openEditDialog: (item: ScheduleItem) => void;
  handleDelete: (id: number) => void;
  formatDate: (dateStr: string) => string;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  scheduleItems,
  openEditDialog,
  handleDelete,
  formatDate
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Atividade</TableHead>
          <TableHead>Dia</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Local</TableHead>
          <TableHead>Global</TableHead>
          <TableHead className="w-24">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduleItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              Nenhuma atividade de cronograma encontrada
            </TableCell>
          </TableRow>
        ) : (
          scheduleItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.atividade}</TableCell>
              <TableCell>{formatDate(item.dia)}</TableCell>
              <TableCell>
                {item.horario_inicio} {item.horario_fim ? `- ${item.horario_fim}` : ''}
              </TableCell>
              <TableCell>{item.local}</TableCell>
              <TableCell>{item.global ? 'Sim' : 'Não'}</TableCell>
              <TableCell>
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
          ))
        )}
      </TableBody>
    </Table>
  );
};
