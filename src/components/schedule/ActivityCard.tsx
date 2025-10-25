
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  category: string;
  activities: Array<{
    id: number;
    cronograma_atividade_id: number;
    atividade: string;
    local: string;
    modalidade_nome: string | null;
    modalidade_status: string | null;
    global: boolean;
  }>;
}

export function ActivityCard({ category, activities }: ActivityCardProps) {
  const getActivityStyle = (activities: ActivityCardProps['activities']) => {
    const isGlobal = activities.some(act => act.global);
    if (isGlobal) {
      return 'border-warning bg-warning-background';
    }
    
    const statuses = activities.map(act => act.modalidade_status?.toLowerCase());
    
    // If at least one modality is confirmed, show green border
    if (statuses.includes('confirmado')) {
      return 'border-success bg-success-background';
    }
    
    // If ALL modalities are canceled, show red border
    if (statuses.length > 0 && statuses.every(status => status === 'cancelado')) {
      return 'border-destructive bg-destructive/5';
    }
    
    // Default style for other cases (pending or mixed statuses)
    return 'border-border bg-card';
  };

  const getStatusColor = (status: string | null, isGlobal: boolean) => {
    if (isGlobal) return 'bg-warning-background text-warning-foreground hover:bg-warning/10';
    if (!status) return 'bg-neutral-background text-neutral-foreground hover:bg-neutral/10';
    
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'bg-success-background text-success-foreground hover:bg-success/10';
      case 'pendente':
        return 'bg-warning-background text-warning-foreground hover:bg-warning/10';
      case 'cancelado':
        return 'bg-destructive/10 text-destructive-foreground hover:bg-destructive/20';
      default:
        return 'bg-neutral-background text-neutral-foreground hover:bg-neutral/10';
    }
  };

  // Get unique location from activities
  const location = activities[0]?.local || '';

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        getActivityStyle(activities)
      )}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-foreground">{activities[0].atividade}</h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-muted-foreground">
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
                    getStatusColor(activity.modalidade_status, activity.global),
                    'whitespace-nowrap'
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
