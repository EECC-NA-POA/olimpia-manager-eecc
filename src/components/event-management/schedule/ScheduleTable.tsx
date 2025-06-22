
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
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Clock, MapPin, Calendar } from 'lucide-react';
import { ScheduleItem } from './types';
import { diasSemana } from './constants';

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
  const getDiaLabel = (value: string) => {
    return diasSemana.find(d => d.value === value)?.label || value;
  };

  const renderRecurrentInfo = (item: ScheduleItem) => {
    if (!item.recorrente || !item.dias_semana || !item.horarios_por_dia || !item.locais_por_dia) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1 mb-2">
          <Calendar className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-600">Atividade Recorrente</span>
        </div>
        
        {item.dias_semana.map(dia => {
          const horario = item.horarios_por_dia?.[dia];
          const local = item.locais_por_dia?.[dia];
          
          return (
            <div key={dia} className="bg-blue-50 p-2 rounded text-xs border-l-2 border-blue-200">
              <div className="font-medium text-blue-800 mb-1">
                {getDiaLabel(dia)}
              </div>
              
              {horario && (
                <div className="flex items-center gap-1 text-gray-600 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{horario.inicio} - {horario.fim}</span>
                </div>
              )}
              
              {local && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{local}</span>
                </div>
              )}
            </div>
          );
        })}
        
        {item.data_fim_recorrencia && (
          <div className="text-xs text-gray-500 mt-2">
            Até: {formatDate(item.data_fim_recorrencia)}
          </div>
        )}
      </div>
    );
  };

  const renderNonRecurrentInfo = (item: ScheduleItem) => {
    return (
      <>
        <TableCell>{formatDate(item.dia)}</TableCell>
        <TableCell>
          {item.horario_inicio} {item.horario_fim ? `- ${item.horario_fim}` : ''}
        </TableCell>
        <TableCell>{item.local}</TableCell>
      </>
    );
  };

  const renderRecurrentCells = () => {
    return (
      <>
        <TableCell colSpan={3} className="p-0">
          {/* Conteúdo será renderizado na célula da atividade */}
        </TableCell>
      </>
    );
  };

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
            <TableRow key={item.id}>
              <TableCell className="align-top">
                <div className="space-y-2">
                  <div className="font-medium">{item.atividade}</div>
                  {item.recorrente && renderRecurrentInfo(item)}
                </div>
              </TableCell>
              
              {item.recorrente ? (
                renderRecurrentCells()
              ) : (
                renderNonRecurrentInfo(item)
              )}
              
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
          ))
        )}
      </TableBody>
    </Table>
  );
};
