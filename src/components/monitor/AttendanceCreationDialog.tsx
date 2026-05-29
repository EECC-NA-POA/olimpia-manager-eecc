
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Save, ChevronDown, Settings2, UserCheck, UserX, Clock } from "lucide-react";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import AthleteAttendanceCard from './attendance-creation/AthleteAttendanceCard';

interface AttendanceCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalidadeRepId: string | null;
  modalityName: string;
}

interface AthleteAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status: 'presente' | 'ausente' | 'atrasado';
}

function toLocalDatetimeValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AttendanceCreationDialog({
  open,
  onOpenChange,
  modalidadeRepId,
  modalityName
}: AttendanceCreationDialogProps) {
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: '',
    observacoes: ''
  });
  const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: athletes, isLoading: athletesLoading } = useModalityAthletes(modalidadeRepId || undefined);
  const { createSessionWithAttendance } = useMonitorMutations();

  // Pré-preenche data/hora atual ao abrir
  useEffect(() => {
    if (open) {
      setSessionForm({
        data_hora_inicio: toLocalDatetimeValue(new Date()),
        data_hora_fim: '',
        descricao: '',
        observacoes: ''
      });
      setDetailsOpen(false);
    }
  }, [open]);

  // Inicializa todos como presentes
  useEffect(() => {
    if (athletes && open) {
      setAthletesAttendance(athletes.map(athlete => ({
        id: athlete.id,
        nome_completo: athlete.nome_completo,
        email: athlete.email,
        numero_identificador: athlete.numero_identificador,
        status: 'presente' as const
      })));
    }
  }, [athletes, open]);

  const handleStatusChange = (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => {
    setAthletesAttendance(prev =>
      prev.map(a => a.id === athleteId ? { ...a, status } : a)
    );
  };

  const handleCreateSession = async () => {
    if (!modalidadeRepId) return;
    try {
      await createSessionWithAttendance.mutateAsync({
        modalidade_rep_id: modalidadeRepId,
        data_hora_inicio: sessionForm.data_hora_inicio,
        data_hora_fim: sessionForm.data_hora_fim || undefined,
        descricao: sessionForm.descricao || 'Chamada de presença',
        observacoes: sessionForm.observacoes,
        attendances: athletesAttendance.map(a => ({ atleta_id: a.id, status: a.status }))
      });
      setSessionForm({ data_hora_inicio: '', data_hora_fim: '', descricao: '', observacoes: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const presentes = athletesAttendance.filter(a => a.status === 'presente').length;
  const atrasados = athletesAttendance.filter(a => a.status === 'atrasado').length;
  const ausentes  = athletesAttendance.filter(a => a.status === 'ausente').length;
  const total     = athletesAttendance.length;
  const canCreate = !!sessionForm.data_hora_inicio && total > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">
            Chamada — {modalityName}
          </DialogTitle>
        </DialogHeader>

        {athletesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Carregando atletas...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Contador de status */}
            {total > 0 && (
              <div className="grid grid-cols-4 gap-px bg-border mx-5 mt-4 rounded-xl overflow-hidden border">
                <div className="bg-card text-center py-2.5 px-1">
                  <div className="text-xl font-bold text-foreground">{total}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
                </div>
                <div className="bg-card text-center py-2.5 px-1">
                  <div className="text-xl font-bold text-green-600">{presentes}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Presentes</div>
                </div>
                <div className="bg-card text-center py-2.5 px-1">
                  <div className="text-xl font-bold text-amber-500">{atrasados}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Atrasados</div>
                </div>
                <div className="bg-card text-center py-2.5 px-1">
                  <div className="text-xl font-bold text-red-500">{ausentes}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Ausentes</div>
                </div>
              </div>
            )}

            {/* Lista de atletas */}
            <div className="px-5 mt-4 space-y-2">
              {athletesAttendance.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum atleta inscrito nesta modalidade.
                </p>
              )}
              {athletesAttendance.map(athlete => (
                <AthleteAttendanceCard
                  key={athlete.id}
                  athlete={athlete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Detalhes opcionais — colapsado */}
            <div className="px-5 mt-4 mb-2">
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full py-2 transition-colors">
                    <Settings2 className="h-4 w-4" />
                    <span>Detalhes opcionais</span>
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2 pb-1">
                  {/* Data/hora num grid compacto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="data_hora_inicio" className="text-xs">Início *</Label>
                      <Input
                        id="data_hora_inicio"
                        type="datetime-local"
                        value={sessionForm.data_hora_inicio}
                        onChange={e => setSessionForm({ ...sessionForm, data_hora_inicio: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="data_hora_fim" className="text-xs">Fim (opcional)</Label>
                      <Input
                        id="data_hora_fim"
                        type="datetime-local"
                        value={sessionForm.data_hora_fim}
                        onChange={e => setSessionForm({ ...sessionForm, data_hora_fim: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="descricao" className="text-xs">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={sessionForm.descricao}
                      onChange={e => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                      placeholder="Descreva o objetivo desta chamada..."
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="observacoes" className="text-xs">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={sessionForm.observacoes}
                      onChange={e => setSessionForm({ ...sessionForm, observacoes: e.target.value })}
                      placeholder="Atletas presentes sem cadastro, outras observações..."
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {/* Botões — fixos no rodapé */}
        <div className="flex gap-2 px-5 py-4 border-t bg-card flex-shrink-0">
          <Button
            onClick={handleCreateSession}
            disabled={!canCreate || createSessionWithAttendance.isPending}
            className="flex-1"
          >
            {createSessionWithAttendance.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Criar Chamada
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
