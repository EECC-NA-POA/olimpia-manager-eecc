
import React from 'react';
import { Clock } from "lucide-react";
import { ActivityCard } from './ActivityCard';

interface ScheduleActivity {
  id: number;
  cronograma_atividade_id: number;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  dia: string;
  local: string;
  global: boolean;
  modalidade_nome: string | null;
  modalidade_status: string | null;
}

interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}

interface ScheduleTableProps {
  groupedActivities: GroupedActivities;
  dates: string[];
  timeSlots: string[];
}

export function ScheduleTable({ groupedActivities, dates, timeSlots }: ScheduleTableProps) {
  if (!dates.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma atividade encontrada no cronograma.
      </div>
    );
  }

  const weekDays = ["Sábado", "Domingo"];
  const columnWidth = `${100 / (weekDays.length + 1)}%`;

  // Helper function to group activities by category
  const groupByCategory = (activities: ScheduleActivity[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const category = activity.modalidade_nome?.split(' - ')[0] || 'Geral';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(activity);
      return acc;
    }, {} as Record<string, ScheduleActivity[]>);

    // Sort categories alphabetically
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
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
            {weekDays.map((day, index) => (
              <th 
                key={day} 
                className="border-b p-4 text-left font-semibold text-olimpics-green-primary"
                style={{ width: columnWidth }}
              >
                {day}
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
                          <ActivityCard 
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
