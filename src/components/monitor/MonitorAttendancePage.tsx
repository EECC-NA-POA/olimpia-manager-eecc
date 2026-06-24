
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useAllMonitorSessions } from "@/hooks/useAllMonitorSessions";
import { useEventSessions } from "@/hooks/useEventSessions";
import { useUserRoleCheck } from "@/hooks/useUserRoleCheck";
import { useAuth } from "@/contexts/AuthContext";
import { MonitorSession } from "@/hooks/useMonitorSessions";
import { LoadingImage } from "@/components/ui/loading-image";
import AttendanceCreationDialog from './AttendanceCreationDialog';
import EditAttendanceDialog from './EditAttendanceDialog';
import AttendanceSessionDetail from './AttendanceSessionDetail';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/* ── helpers ─────────────────────────────────────────────── */

function SessionRow({
  session,
  onView,
  onEdit,
}: {
  session: MonitorSession;
  onView: (id: string) => void;
  onEdit: (s: MonitorSession) => void;
}) {
  const hasObs = !!(session as any).observacoes?.trim();
  const dateStr = format(new Date(session.data_hora_inicio), "dd MMM yyyy", { locale: ptBR });
  const timeStr = format(new Date(session.data_hora_inicio), "HH:mm", { locale: ptBR });
  const endTime = session.data_hora_fim
    ? format(new Date(session.data_hora_fim), "HH:mm", { locale: ptBR })
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer hover:bg-muted/40 group",
        hasObs && "border-amber-200 bg-amber-50/40"
      )}
      onClick={() => onView(session.id)}
    >
      {/* Date pill */}
      <div className="flex-shrink-0 text-center w-14 rounded-lg bg-olimpics-green-primary/10 border border-olimpics-green-primary/20 py-1.5 px-1">
        <p className="text-[10px] font-semibold text-olimpics-green-primary uppercase leading-none">
          {format(new Date(session.data_hora_inicio), "MMM", { locale: ptBR })}
        </p>
        <p className="text-lg font-bold text-olimpics-green-primary leading-none mt-0.5">
          {format(new Date(session.data_hora_inicio), "dd")}
        </p>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {session.descricao || "Chamada"}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeStr}{endTime && ` – ${endTime}`}
          </span>
          <span className="text-border">•</span>
          <span className="truncate max-w-[140px]">
            {session.modalidade_representantes.modalidades.nome}
          </span>
        </div>
        {hasObs && (
          <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{(session as any).observacoes}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(session)}
        >
          Editar
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────── */

export default function MonitorAttendancePage() {
  const [modFiltro, setModFiltro] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<MonitorSession | null>(null);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);

  const { user, currentEventId } = useAuth();
  const { data: roleData } = useUserRoleCheck(user?.id ?? '', currentEventId ?? '');
  const isOrganizer = roleData?.isOrganizer ?? false;

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: monitorSessions, isLoading: monitorSessionsLoading } = useAllMonitorSessions();
  const { data: eventSessions, isLoading: eventSessionsLoading } = useEventSessions();

  const sessionsLoading = isOrganizer ? eventSessionsLoading : monitorSessionsLoading;
  const rawSessions = isOrganizer ? (eventSessions ?? []) : (monitorSessions ?? []);

  /* ── detail view ── */
  if (detailSessionId) {
    return (
      <AttendanceSessionDetail
        sessionId={detailSessionId}
        onBack={() => setDetailSessionId(null)}
      />
    );
  }

  /* ── loading ── */
  if (modalitiesLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingImage text="Carregando chamadas..." />
      </div>
    );
  }

  const validModalities = (modalities ?? []).filter(m => m.modalidades?.nome);

  /* ── no modalities (only block for non-organizers) ── */
  if (!isOrganizer && validModalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-sm font-medium text-foreground">Nenhuma modalidade atribuída</p>
        <p className="text-xs text-muted-foreground mt-1">
          Você ainda não está registrado como monitor de nenhuma modalidade neste evento.
        </p>
      </div>
    );
  }

  /* ── selected modality for dialog (only relevant if user is also a monitor) ── */
  const selectedMod = modFiltro !== "all"
    ? validModalities.find(m => m.id === modFiltro)
    : validModalities[0];

  /* ── filter sessions ── */
  const sessions = rawSessions.filter(s => {
    if (modFiltro === "all") return true;
    return validModalities.find(
      m => m.id === modFiltro &&
        m.modalidades.nome === s.modalidade_representantes.modalidades.nome
    );
  });

  return (
    <div className="space-y-4 max-w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Modality filter */}
        {validModalities.length > 1 && (
          <Select value={modFiltro} onValueChange={setModFiltro}>
            <SelectTrigger className="w-56 text-sm">
              <SelectValue placeholder="Todas as modalidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as modalidades</SelectItem>
              {validModalities.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.modalidades.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {validModalities.length > 0 && (
          <div className="sm:ml-auto">
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Chamada
            </Button>
          </div>
        )}
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">Nenhuma chamada ainda</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {modFiltro === "all"
              ? "Nenhuma chamada registrada neste evento ainda."
              : "Não há chamadas para esta modalidade."}
          </p>
          {validModalities.length > 0 && (
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Chamada
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {sessions.length} chamada{sessions.length !== 1 ? "s" : ""} encontrada{sessions.length !== 1 ? "s" : ""}
          </p>
          {sessions.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              onView={setDetailSessionId}
              onEdit={s => { setSessionToEdit(s); setShowEdit(true); }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AttendanceCreationDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        modalidadeRepId={selectedMod?.id ?? null}
        modalityName={selectedMod?.modalidades.nome ?? ""}
      />

      {sessionToEdit && (
        <EditAttendanceDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          session={sessionToEdit}
        />
      )}
    </div>
  );
}
