
import React from 'react';
import { UserCheck, UserX, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AthleteAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status: 'presente' | 'ausente' | 'atrasado';
}

interface AthleteAttendanceCardProps {
  athlete: AthleteAttendance;
  onStatusChange: (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => void;
}

const STATUS_CONFIG = {
  presente: {
    label: 'P',
    labelFull: 'Presente',
    icon: UserCheck,
    active: 'bg-green-500 text-white border-green-500',
    row: 'border-l-green-500 bg-green-50/60',
  },
  atrasado: {
    label: 'A',
    labelFull: 'Atrasado',
    icon: Clock,
    active: 'bg-amber-500 text-white border-amber-500',
    row: 'border-l-amber-400 bg-amber-50/60',
  },
  ausente: {
    label: 'F',
    labelFull: 'Faltou',
    icon: UserX,
    active: 'bg-red-500 text-white border-red-500',
    row: 'border-l-red-400 bg-red-50/60',
  },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export default function AthleteAttendanceCard({ athlete, onStatusChange }: AthleteAttendanceCardProps) {
  const current = STATUS_CONFIG[athlete.status];

  return (
    <div className={cn(
      "flex items-center gap-3 border-l-4 rounded-lg px-3 py-2.5 border border-border/50 transition-colors",
      current.row
    )}>
      {/* ID */}
      {athlete.numero_identificador && (
        <span className="text-xs font-mono font-semibold text-muted-foreground w-8 flex-shrink-0 text-center">
          #{athlete.numero_identificador}
        </span>
      )}

      {/* Nome */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {athlete.nome_completo}
        </p>
      </div>

      {/* Botões de status */}
      <div className="flex gap-1 flex-shrink-0">
        {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const isActive = athlete.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(athlete.id, s)}
              title={cfg.labelFull}
              className={cn(
                "h-9 w-9 rounded-lg border text-xs font-bold transition-all duration-100 flex items-center justify-center",
                isActive
                  ? cfg.active
                  : "bg-white border-border text-muted-foreground hover:border-gray-400"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
