
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

  // Separate punctual (non-recurrent) vs recurrent using presence of dias_semana
  const recurrentActivities = activities.filter(a => Array.isArray(a.dias_semana) && a.dias_semana.length > 0);
  const punctualActivities = activities.filter(a => !Array.isArray(a.dias_semana) || a.dias_semana.length === 0);
  const hasRecurrent = recurrentActivities.length > 0;

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
          {hasRecurrent && (
            <Badge variant="outline" className="ml-2 text-xs">
              Recorrente
            </Badge>
          )}
        </h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-gray-600">
            <span>{location}</span>
          </div>

          {punctualActivities.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Pontuais</div>
              <div className="flex flex-wrap gap-2">
                {punctualActivities.map((activity) => {
                  const displayName = activity.modalidade_nome || activity.atividade;
                  return (
                    <Badge 
                      key={`${activity.cronograma_atividade_id}-${activity.modalidade_nome}-pontual`}
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
          )}

          {recurrentActivities.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-green-100">
              <div className="text-xs text-gray-500">Recorrentes</div>
              <div className="flex flex-wrap gap-2">
                {recurrentActivities.map((activity) => {
                  const displayName = activity.modalidade_nome || activity.atividade;
                  return (
                    <Badge 
                      key={`${activity.cronograma_atividade_id}-${activity.modalidade_nome}-recorrente`}
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
          )}
        </div>
      </div>
    </div>
  );
}

