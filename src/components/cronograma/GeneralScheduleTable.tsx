
import React from 'react';
import { Clock } from "lucide-react";
import { GeneralScheduleActivityCard } from './GeneralScheduleActivityCard';
import { ScheduleActivity, GroupedActivities } from './types';
import { getDayLabel } from './utils';

interface GeneralScheduleTableProps {
  groupedActivities: GroupedActivities;
  dates: string[];
  timeSlots: string[];
}

export function GeneralScheduleTable({ groupedActivities, dates, timeSlots }: GeneralScheduleTableProps) {
  if (!dates.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma atividade encontrada no cronograma.
      </div>
    );
  }

  const columnWidth = `${100 / (dates.length + 1)}%`;

  const groupByCategory = (activities: ScheduleActivity[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const category = activity.atividade;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      const isDuplicate = acc[category].some(
        existing => existing.cronograma_atividade_id === activity.cronograma_atividade_id &&
                    existing.modalidade_nome === activity.modalidade_nome
      );
      
      if (!isDuplicate) {
        acc[category].push(activity);
      }
      
      return acc;
    }, {} as Record<string, ScheduleActivity[]>);

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th 
              className="border-b p-4 text-left font-semibold text-olimpics-green-primary"
              style={{ width: columnWidth }}
            >
              Horário
            </th>
            {dates.map((day) => (
              <th 
                key={day} 
                className="border-b p-4 text-left font-semibold text-olimpics-green-primary"
                style={{ width: columnWidth }}
              >
                {getDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => {
            const [start, end] = timeSlot.split('-');
            return (
              <tr key={timeSlot} className="border-b last:border-b-0">
                <td className="p-4 align-top" style={{ width: columnWidth }}>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {start.slice(0, 5)} - {end.slice(0, 5)}
                    </span>
                  </div>
                </td>
                {dates.map((date) => {
                  const activitiesForSlot = groupedActivities[date]?.[timeSlot] || [];
                  const groupedByCategory = groupByCategory(activitiesForSlot);

                  return (
                    <td 
                      key={`${date}-${timeSlot}`} 
                      className="p-4 align-top"
                      style={{ width: columnWidth }}
                    >
                      <div className="space-y-2">
                        {groupedByCategory.map(([category, activities]) => (
                          <GeneralScheduleActivityCard 
                            key={category}
                            category={category}
                            activities={activities}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
