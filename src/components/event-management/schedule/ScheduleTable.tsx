
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
  const getDiaLabel = (value: string): string => {
    return diasSemana.find(d => d.value === value)?.label || value;
  };

  const renderRecurrentInfo = (item: ScheduleItem): React.ReactNode => {
    console.log('Rendering recurrent info for item:', item);
    
    if (!item.recorrente) {
      return null;
    }

    // Check if we have the required recurrent data
    if (!item.dias_semana || !Array.isArray(item.dias_semana) || item.dias_semana.length === 0) {
      return (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Atividade Recorrente</span>
          </div>
          <div className="text-xs text-gray-500 italic">
            Dados de recorrência não configurados
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
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
              
              {(!horario || !local) && (
                <div className="text-xs text-gray-500 italic">
                  {!horario && 'Horário não configurado'} 
                  {!horario && !local && ' - '}
                  {!local && 'Local não configurado'}
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

  const renderRecurrentSummary = (item: ScheduleItem): React.ReactNode => {
    if (!item.recorrente || !item.dias_semana || !Array.isArray(item.dias_semana)) {
      return <div className="text-sm text-gray-500 italic">Dados não configurados</div>;
    }

    const diasCount = item.dias_semana.length;
    const diasLabels = item.dias_semana.map(dia => getDiaLabel(dia)).join(', ');
    
    return (
      <div className="text-sm">
        <div className="font-medium text-gray-700 mb-1">
          {diasCount} dia{diasCount > 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-500">
          {diasLabels}
        </div>
      </div>
    );
  };

  const renderRecurrentTimesSummary = (item: ScheduleItem): React.ReactNode => {
    if (!item.recorrente || !item.horarios_por_dia) {
      return <div className="text-sm text-gray-500 italic">Horários não configurados</div>;
    }

    const horariosUnicos = new Set<string>();
    Object.values(item.horarios_por_dia).forEach(horario => {
      if (horario && horario.inicio && horario.fim) {
        horariosUnicos.add(`${horario.inicio} - ${horario.fim}`);
      }
    });

    if (horariosUnicos.size === 0) {
      return <div className="text-sm text-gray-500 italic">Horários não configurados</div>;
    }

    return (
      <div className="text-sm">
        {horariosUnicos.size === 1 ? (
          <div className="text-gray-700">
            {Array.from(horariosUnicos)[0]}
          </div>
        ) : (
          <div>
            <div className="font-medium text-gray-700 mb-1">
              {horariosUnicos.size} horários diferentes
            </div>
            <div className="text-xs text-gray-500">
              {Array.from(horariosUnicos).join(', ')}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecurrentLocationsSummary = (item: ScheduleItem): React.ReactNode => {
    if (!item.recorrente || !item.locais_por_dia) {
      return <div className="text-sm text-gray-500 italic">Locais não configurados</div>;
    }

    const locaisUnicos = new Set<string>();
    Object.values(item.locais_por_dia).forEach(local => {
      if (local && local.trim()) {
        locaisUnicos.add(local.trim());
      }
    });

    if (locaisUnicos.size === 0) {
      return <div className="text-sm text-gray-500 italic">Locais não configurados</div>;
    }

    return (
      <div className="text-sm">
        {locaisUnicos.size === 1 ? (
          <div className="text-gray-700">
            {Array.from(locaisUnicos)[0]}
          </div>
        ) : (
          <div>
            <div className="font-medium text-gray-700 mb-1">
              {locaisUnicos.size} locais diferentes
            </div>
            <div className="text-xs text-gray-500">
              {Array.from(locaisUnicos).join(', ')}
            </div>
          </div>
        )}
      </div>
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
              
              <TableCell className="align-top">
                {item.recorrente ? (
                  renderRecurrentSummary(item)
                ) : (
                  formatDate(item.dia)
                )}
              </TableCell>
              
              <TableCell className="align-top">
                {item.recorrente ? (
                  renderRecurrentTimesSummary(item)
                ) : (
                  `${item.horario_inicio} ${item.horario_fim ? `- ${item.horario_fim}` : ''}`
                )}
              </TableCell>
              
              <TableCell className="align-top">
                {item.recorrente ? (
                  renderRecurrentLocationsSummary(item)
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
          ))
        )}
      </TableBody>
    </Table>
  );
};
