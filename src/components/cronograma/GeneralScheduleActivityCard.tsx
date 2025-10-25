
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
        ? "border-warning bg-warning-background" 
        : "border-success bg-success-background"
    )}>
      <div className="space-y-2">
        <h4 className="font-medium text-foreground">
          {activities[0].atividade}
          {hasRecurrent && (
            <Badge variant="outline" className="ml-2 text-xs">
              Recorrente
            </Badge>
          )}
        </h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-muted-foreground">
            <span>{location}</span>
          </div>

          {punctualActivities.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pontuais</div>
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
                          ? "bg-warning-background text-warning-foreground hover:bg-warning/10"
                          : "bg-success-background text-success-foreground hover:bg-success/10"
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
            <div className="space-y-1 pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">Recorrentes</div>
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
                          ? "bg-warning-background text-warning-foreground hover:bg-warning/10"
                          : "bg-success-background text-success-foreground hover:bg-success/10"
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

