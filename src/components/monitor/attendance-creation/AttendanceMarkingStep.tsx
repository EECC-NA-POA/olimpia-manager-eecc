
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import AttendanceStatusSummary from './AttendanceStatusSummary';
import AthleteAttendanceCard from './AthleteAttendanceCard';

interface AthleteAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status: 'presente' | 'ausente' | 'atrasado';
}

interface AttendanceMarkingStepProps {
  sessionForm: {
    descricao: string;
  };
  modalityName: string;
  athletesAttendance: AthleteAttendance[];
  onStatusChange: (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => void;
  onBack: () => void;
  onCreateSession: () => void;
  isCreating: boolean;
}

export default function AttendanceMarkingStep({
  sessionForm,
  modalityName,
  athletesAttendance,
  onStatusChange,
  onBack,
  onCreateSession,
  isCreating
}: AttendanceMarkingStepProps) {
  return (
    <div className="space-y-4 py-2 max-h-[70vh] overflow-auto">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">{sessionForm.descricao || 'Chamada de presença'}</h3>
          <p className="text-sm text-gray-500">{modalityName}</p>
        </div>
      </div>

      <AttendanceStatusSummary athletesAttendance={athletesAttendance} />

      <div className="space-y-3">
        {athletesAttendance.map((athlete) => (
          <AthleteAttendanceCard
            key={athlete.id}
            athlete={athlete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button 
          onClick={onCreateSession}
          disabled={isCreating}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Criar Chamada
        </Button>
      </div>
    </div>
  );
}
