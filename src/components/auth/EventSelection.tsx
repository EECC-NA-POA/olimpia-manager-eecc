
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, History, ChevronDown, ChevronUp, Zap, Info } from "lucide-react";
import { LoadingImage } from "@/components/ui/loading-image";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PerfilTipo } from "@/lib/types/database";
import { EventCard } from "./event-selection/EventCard";
import { useEventQuery } from "./event-selection/useEventQuery";
import { useEventRegistration } from "./event-selection/useEventRegistration";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
  isUnderAge?: boolean;
  onEventsRefresh?: (refetchFn: () => void) => void;
}

export const EventSelection = ({
  selectedEvents,
  onEventSelect,
  mode,
  isUnderAge = false,
  onEventsRefresh,
}: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user, signOut, setCurrentEventId } = useAuth();
  const [selectedRoleByEvent, setSelectedRoleByEvent] = useState<Record<string, PerfilTipo>>({});
  const [showHistory, setShowHistory] = useState(false);

  const { data: events = [], isLoading, refetch } = useEventQuery(user?.id, true);
  const registerEventMutation = useEventRegistration(user?.id);

  React.useEffect(() => {
    if (onEventsRefresh) onEventsRefresh(refetch);
  }, [refetch, onEventsRefresh]);

  // Separate active vs historical
  const activeEvents = events.filter(e => e.status_evento !== 'encerrado');
  const historicalEvents = events.filter(
    (e) => e.status_evento === 'encerrado' && (e as any).isRegistered
  );

  const handleEventRegistration = async (eventId: string) => {
    try {
      const role = selectedRoleByEvent[eventId] ?? 'ATL';
      const result = await registerEventMutation.mutateAsync({ eventId, selectedRole: role });
      localStorage.setItem('currentEventId', eventId);
      setCurrentEventId(eventId);
      toast(result.isExisting ? 'Bem-vindo de volta ao evento!' : 'Inscrição realizada com sucesso!');
      setTimeout(() => navigate('/dashboard'), 300);
    } catch {
      toast.error('Erro ao processar inscrição. Tente novamente.');
    }
  };

  const handleEventAction = (eventId: string, isRegistered: boolean) => {
    if (isRegistered) {
      localStorage.setItem('currentEventId', eventId);
      setCurrentEventId(eventId);
      toast('Evento selecionado com sucesso!');
      setTimeout(() => navigate('/dashboard'), 300);
    } else {
      handleEventRegistration(eventId);
    }
  };

  const handleExit = async () => {
    try {
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch {
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingImage text="Carregando eventos..." />
      </div>
    );
  }

  const hasNoEvents = activeEvents.length === 0 && historicalEvents.length === 0;

  return (
    <div className="space-y-8">
      {/* ── ACTIVE EVENTS ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <h2 className="text-base font-bold text-gray-800">Eventos Disponíveis</h2>
          {activeEvents.length > 0 && (
            <span className="ml-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
              {activeEvents.length}
            </span>
          )}
        </div>

        {activeEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
            <Zap className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Nenhum evento ativo no momento</p>
            <p className="text-xs mt-1 text-gray-400 max-w-xs">
              Novos eventos serão exibidos aqui quando estiverem com inscrições abertas.
            </p>
          </div>
        ) : (
          <>
            {/* Role tip — only shown when there are unregistered active events */}
            {activeEvents.some((e: any) => !e.isRegistered) && (
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Selecione <strong>Atleta</strong> para participar de modalidades, ou{' '}
                  <strong>Público Geral</strong> apenas para assistir.
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selectedRole={selectedRoleByEvent[event.id] ?? 'ATL'}
                  onRoleChange={(value) =>
                    setSelectedRoleByEvent((prev) => ({ ...prev, [event.id]: value }))
                  }
                  onEventAction={() => handleEventAction(event.id, event.isRegistered)}
                  isUnderAge={isUnderAge}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── HISTORICAL EVENTS (collapsible) ── */}
      {historicalEvents.length > 0 && (
        <section>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors group w-full"
          >
            <History className="w-4 h-4 flex-shrink-0" />
            <span>Meu histórico de eventos</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 ml-0.5">
              {historicalEvents.length}
            </span>
            <span className="ml-auto">
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </span>
          </button>

          {showHistory && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {historicalEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selectedRole={selectedRoleByEvent[event.id] ?? 'ATL'}
                  onRoleChange={(value) =>
                    setSelectedRoleByEvent((prev) => ({ ...prev, [event.id]: value }))
                  }
                  onEventAction={() => handleEventAction(event.id, event.isRegistered)}
                  isUnderAge={isUnderAge}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── NO EVENTS AT ALL ── */}
      {hasNoEvents && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
          <p className="text-sm">Nenhum evento disponível no momento.</p>
        </div>
      )}

      {/* ── LOGOUT ── */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleExit}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
};
