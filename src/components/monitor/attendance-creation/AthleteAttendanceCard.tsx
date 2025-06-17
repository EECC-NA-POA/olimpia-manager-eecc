
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock } from "lucide-react";

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

export default function AthleteAttendanceCard({ athlete, onStatusChange }: AthleteAttendanceCardProps) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm sm:text-base truncate">{athlete.nome_completo}</div>
          <div className="text-xs sm:text-sm text-gray-500 truncate">{athlete.email}</div>
          {athlete.numero_identificador && (
            <Badge variant="outline" className="text-xs mt-1">
              ID: {athlete.numero_identificador}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant={athlete.status === 'presente' ? 'default' : 'outline'}
            onClick={() => onStatusChange(athlete.id, 'presente')}
            className={athlete.status === 'presente' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Presente</span>
            <span className="sm:hidden">P</span>
          </Button>
          <Button
            size="sm"
            variant={athlete.status === 'atrasado' ? 'default' : 'outline'}
            onClick={() => onStatusChange(athlete.id, 'atrasado')}
            className={athlete.status === 'atrasado' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Atrasado</span>
            <span className="sm:hidden">A</span>
          </Button>
          <Button
            size="sm"
            variant={athlete.status === 'ausente' ? 'default' : 'outline'}
            onClick={() => onStatusChange(athlete.id, 'ausente')}
            className={athlete.status === 'ausente' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <UserX className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Ausente</span>
            <span className="sm:hidden">F</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
