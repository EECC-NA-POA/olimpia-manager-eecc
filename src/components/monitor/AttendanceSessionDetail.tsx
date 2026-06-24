
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, ChevronDown, ChevronUp } from "lucide-react";
import { useSessionAttendance, useAthletesForAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { useChamadaAuditLog, AuditLogEntry } from "@/hooks/useChamadaAuditLog";
import { LoadingImage } from "@/components/ui/loading-image";
import { useSessionDetail } from "./attendance-session-detail/useSessionDetail";
import { useAttendanceLogic } from "./attendance-session-detail/useAttendanceLogic";
import { SessionHeader } from "./attendance-session-detail/SessionHeader";
import { AttendanceSummaryCards } from "./attendance-session-detail/AttendanceSummaryCards";
import { AthletesList } from "./attendance-session-detail/AthletesList";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AttendanceSessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

/* ── helpers para o log de auditoria ─────────────────────── */

function operationLabel(entry: AuditLogEntry): string {
  if (entry.entidade === 'chamada') {
    if (entry.operation === 'INSERT') return 'Chamada criada';
    if (entry.operation === 'UPDATE') return 'Chamada editada';
    return 'Chamada excluída';
  }
  // presenca
  if (entry.operation === 'INSERT') return 'Presença registrada';
  if (entry.operation === 'UPDATE') return 'Presença alterada';
  return 'Presença removida';
}

function operationBadgeVariant(op: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (op === 'INSERT') return 'default';
  if (op === 'UPDATE') return 'secondary';
  return 'destructive';
}

function statusLabel(status: string | undefined): string {
  if (status === 'presente') return 'Presente';
  if (status === 'ausente') return 'Ausente';
  if (status === 'atrasado') return 'Atrasado';
  return status ?? '—';
}

function AuditEntry({ entry }: { entry: AuditLogEntry }) {
  const isPresenca = entry.entidade === 'presenca';
  const oldStatus = entry.old_data?.status;
  const newStatus = entry.new_data?.status;
  const atletaNome = entry.new_data?.atleta_id ?? entry.old_data?.atleta_id ?? null;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-muted-foreground/40" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={operationBadgeVariant(entry.operation)} className="text-[10px] h-4 px-1.5">
            {operationLabel(entry)}
          </Badge>
          {isPresenca && entry.operation === 'UPDATE' && oldStatus && newStatus && (
            <span className="text-xs text-muted-foreground">
              {statusLabel(oldStatus)} → {statusLabel(newStatus)}
            </span>
          )}
          {isPresenca && entry.operation === 'INSERT' && newStatus && (
            <span className="text-xs text-muted-foreground">{statusLabel(newStatus)}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="font-medium text-foreground">{entry.usuario_nome}</span>
          {' · '}
          {format(new Date(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function AuditLogSection({ chamadaId }: { chamadaId: string }) {
  const [open, setOpen] = useState(false);
  const { data: entries, isLoading } = useChamadaAuditLog(chamadaId);

  if (!isLoading && (!entries || entries.length === 0)) return null;

  return (
    <Card>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Histórico de alterações
          {!isLoading && entries && entries.length > 0 && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{entries.length}</Badge>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <CardContent className="pt-0 pb-3 px-4">
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-2">Carregando histórico…</p>
          ) : (
            <div>
              {entries!.map(e => <AuditEntry key={e.id} entry={e} />)}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/* ── main component ──────────────────────────────────────── */

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

      <AuditLogSection chamadaId={sessionId} />
    </div>
  );
}
