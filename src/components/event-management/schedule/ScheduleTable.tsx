
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
  handleDelete: (id: string) => void;
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
          <TableHead>Título</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Local</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="w-24">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduleItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              Nenhum item de cronograma encontrado
            </TableCell>
          </TableRow>
        ) : (
          scheduleItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.titulo}</TableCell>
              <TableCell>{formatDate(item.data)}</TableCell>
              <TableCell>
                {item.hora_inicio} {item.hora_fim ? `- ${item.hora_fim}` : ''}
              </TableCell>
              <TableCell>{item.local}</TableCell>
              <TableCell>{item.tipo}</TableCell>
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
