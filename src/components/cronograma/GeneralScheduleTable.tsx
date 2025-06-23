
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

  // Mobile layout - stack by time slots
  const renderMobileLayout = () => (
    <div className="space-y-6">
      {timeSlots.map(timeSlot => {
        const [start, end] = timeSlot.split('-');
        return (
          <div key={timeSlot} className="bg-white rounded-lg border shadow-sm">
            <div className="bg-olimpics-green-primary text-white p-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">
                  {start.slice(0, 5)} - {end.slice(0, 5)}
                </span>
              </div>
            </div>
            <div className="p-3 space-y-4">
              {dates.map((date) => {
                const activitiesForSlot = groupedActivities[date]?.[timeSlot] || [];
                const groupedByCategory = groupByCategory(activitiesForSlot);

                if (groupedByCategory.length === 0) return null;

                return (
                  <div key={`${date}-${timeSlot}`} className="border-l-4 border-olimpics-green-primary pl-3">
                    <h4 className="font-semibold text-olimpics-green-primary mb-2">
                      {getDayLabel(date)}
                    </h4>
                    <div className="space-y-2">
                      {groupedByCategory.map(([category, activities]) => (
                        <GeneralScheduleActivityCard 
                          key={category}
                          category={category}
                          activities={activities}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Desktop layout - table format
  const renderDesktopLayout = () => {
    const columnWidth = `${100 / (dates.length + 1)}%`;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
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
  };

  return (
    <>
      {/* Mobile layout - show on screens smaller than lg */}
      <div className="block lg:hidden">
        {renderMobileLayout()}
      </div>
      
      {/* Desktop layout - show on lg screens and larger */}
      <div className="hidden lg:block">
        {renderDesktopLayout()}
      </div>
    </>
  );
}
