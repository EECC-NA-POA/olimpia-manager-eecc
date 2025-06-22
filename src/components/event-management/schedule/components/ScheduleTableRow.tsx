
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Edit, Trash } from 'lucide-react';
import { ScheduleItem } from '../types';
import { RecurrentActivityRenderer } from './RecurrentActivityRenderer';
import { diasSemana } from '../constants';

interface ScheduleTableRowProps {
  item: ScheduleItem;
  openEditDialog: (item: ScheduleItem) => void;
  handleDelete: (id: number) => void;
  formatDate: (dateStr: string) => string;
}

const getDiaLabel = (value: string): string => {
  return diasSemana.find(d => d.value === value)?.label || value;
};

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
          {item.recorrente && <RecurrentActivityRenderer item={item} formatDate={formatDate} />}
        </div>
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Dias da Semana</div>
            <div className="text-xs text-gray-600">
              {item.dias_semana && item.dias_semana.length > 0 
                ? item.dias_semana.map(dia => getDiaLabel(dia)).join(', ')
                : 'Não configurado'
              }
            </div>
          </div>
        ) : (
          item.dia ? formatDate(item.dia) : '-'
        )}
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Horários por Dia</div>
            <div className="text-xs text-gray-600 space-y-1">
              {item.horarios_por_dia && Object.keys(item.horarios_por_dia).length > 0 ? (
                Object.entries(item.horarios_por_dia).map(([dia, horario]) => (
                  <div key={dia}>
                    <span className="font-medium">{getDiaLabel(dia)}:</span> {horario.inicio} - {horario.fim}
                  </div>
                ))
              ) : (
                'Não configurado'
              )}
            </div>
          </div>
        ) : (
          <div>
            {item.horario_inicio || item.horario_fim ? (
              `${item.horario_inicio || ''} ${item.horario_fim ? `- ${item.horario_fim}` : ''}`.trim()
            ) : '-'}
          </div>
        )}
      </TableCell>
      
      <TableCell className="align-top">
        {item.recorrente ? (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Locais por Dia</div>
            <div className="text-xs text-gray-600 space-y-1">
              {item.locais_por_dia && Object.keys(item.locais_por_dia).length > 0 ? (
                Object.entries(item.locais_por_dia).map(([dia, local]) => (
                  <div key={dia}>
                    <span className="font-medium">{getDiaLabel(dia)}:</span> {local}
                  </div>
                ))
              ) : (
                'Não configurado'
              )}
            </div>
            {item.data_fim_recorrencia && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Até:</span> {formatDate(item.data_fim_recorrencia)}
              </div>
            )}
          </div>
        ) : (
          item.local || '-'
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
