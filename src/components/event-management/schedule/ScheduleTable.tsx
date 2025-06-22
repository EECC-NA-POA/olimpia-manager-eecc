
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleItem } from './types';
import { ScheduleTableRow } from './components/ScheduleTableRow';

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
          <TableHead className="min-w-[200px]">Atividade</TableHead>
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
            <ScheduleTableRow
              key={item.id}
              item={item}
              openEditDialog={openEditDialog}
              handleDelete={handleDelete}
              formatDate={formatDate}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};
