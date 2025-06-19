
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSessionAttendance, useAthletesForAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { LoadingImage } from "@/components/ui/loading-image";
import { useSessionDetail } from "./attendance-session-detail/useSessionDetail";
import { useAttendanceLogic } from "./attendance-session-detail/useAttendanceLogic";
import { SessionHeader } from "./attendance-session-detail/SessionHeader";
import { AttendanceSummaryCards } from "./attendance-session-detail/AttendanceSummaryCards";
import { AthletesList } from "./attendance-session-detail/AthletesList";

interface AttendanceSessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export default function AttendanceSessionDetail({ sessionId, onBack }: AttendanceSessionDetailProps) {
  const { data: session, isLoading: sessionLoading } = useSessionDetail(sessionId);
  const { data: existingAttendances, isLoading: attendancesLoading } = useSessionAttendance(sessionId);
  const { data: athletes, isLoading: athletesLoading } = useAthletesForAttendance(session?.modalidade_rep_id || null);
  
  const { saveAttendances } = useMonitorMutations();
  
  const {
    attendanceData,
    handleStatusChange,
    getStatusCounts
  } = useAttendanceLogic(existingAttendances, athletes);

  const handleSaveAttendances = async () => {
    if (!athletes) return;

    const attendancesToSave = athletes.map(athlete => {
      const data = attendanceData.get(athlete.id) || { status: 'presente' };
      return {
        chamada_id: sessionId,
        atleta_id: athlete.id,
        status: data.status as 'presente' | 'ausente' | 'atrasado'
      };
    });

    await saveAttendances.mutateAsync(attendancesToSave);
  };

  if (sessionLoading || attendancesLoading || athletesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando chamada..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-olimpics-text">Sessão não encontrada</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              A sessão solicitada não foi encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-olimpics-text">{session.descricao}</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Nenhum atleta inscrito encontrado para esta modalidade.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = getStatusCounts();

  return (
    <div className="space-y-4 p-4">
      <SessionHeader
        session={session}
        onBack={onBack}
        onSave={handleSaveAttendances}
        isSaving={saveAttendances.isPending}
      />

      <AttendanceSummaryCards counts={counts} />

      <AthletesList
        athletes={athletes}
        attendanceData={attendanceData}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
