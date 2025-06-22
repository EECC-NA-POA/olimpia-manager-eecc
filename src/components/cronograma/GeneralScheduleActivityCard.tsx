
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScheduleActivity } from './types';

interface GeneralScheduleActivityCardProps {
  category: string;
  activities: ScheduleActivity[];
}

export function GeneralScheduleActivityCard({ category, activities }: GeneralScheduleActivityCardProps) {
  const location = activities[0]?.local || '';
  const isGlobal = activities.some(activity => activity.global);
  const isRecurrent = activities.some(activity => activity.recorrente);

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      isGlobal 
        ? "border-yellow-400 bg-yellow-50" 
        : "border-green-600 bg-green-50"
    )}>
      <div className="space-y-2">
        <h4 className="font-medium text-olimpics-green-primary">
          {activities[0].atividade}
          {isRecurrent && (
            <Badge variant="outline" className="ml-2 text-xs">
              Recorrente
            </Badge>
          )}
        </h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-gray-600">
            <span>{location}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => {
              const displayName = activity.modalidade_nome || activity.atividade;
              return (
                <Badge 
                  key={`${activity.cronograma_atividade_id}-${activity.modalidade_nome}`}
                  variant="secondary"
                  className={cn(
                    "whitespace-nowrap",
                    activity.global
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
                      : "bg-green-100 text-green-800 hover:bg-green-100/80"
                  )}
                >
                  {displayName}
                  {activity.global && ' (Todos)'}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
