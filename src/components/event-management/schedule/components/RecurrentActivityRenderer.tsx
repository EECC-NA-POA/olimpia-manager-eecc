
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ScheduleItem } from '../types';
import { diasSemana } from '../constants';

interface RecurrentActivityRendererProps {
  item: ScheduleItem;
  formatDate: (dateStr: string) => string;
}

export const RecurrentActivityRenderer: React.FC<RecurrentActivityRendererProps> = ({
  item,
  formatDate
}) => {
  const getDiaLabel = (value: string): string => {
    return diasSemana.find(d => d.value === value)?.label || value;
  };

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
