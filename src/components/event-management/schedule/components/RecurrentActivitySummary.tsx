
import React from 'react';
import { ScheduleItem } from '../types';
import { diasSemana } from '../constants';

interface RecurrentActivitySummaryProps {
  item: ScheduleItem;
}

const getDiaLabel = (value: string): string => {
  return diasSemana.find(d => d.value === value)?.label || value;
};

export const RecurrentDaysSummary: React.FC<RecurrentActivitySummaryProps> = ({ item }) => {
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

export const RecurrentTimesSummary: React.FC<RecurrentActivitySummaryProps> = ({ item }) => {
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

export const RecurrentLocationsSummary: React.FC<RecurrentActivitySummaryProps> = ({ item }) => {
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
