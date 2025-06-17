
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Users } from "lucide-react";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import AthletesList from './attendance-creation/AthletesList';
import AttendanceStatusSummary from './attendance-creation/AttendanceStatusSummary';
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

export default function AttendanceCreationDialog({ 
  open, 
  onOpenChange, 
  modalidadeRepId,
  modalityName 
}: AttendanceCreationDialogProps) {
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: ''
  });
  const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);

  const { data: athletes, isLoading: athletesLoading } = useModalityAthletes(modalidadeRepId || undefined);
  const { createSessionWithAttendance } = useMonitorMutations();

  useEffect(() => {
    if (athletes && open) {
      // Inicializar todos os atletas como presentes
      const initialAttendance = athletes.map(athlete => ({
        id: athlete.id,
        nome_completo: athlete.nome_completo,
        email: athlete.email,
        numero_identificador: athlete.numero_identificador,
        status: 'presente' as const
      }));
      setAthletesAttendance(initialAttendance);
    }
  }, [athletes, open]);

  const handleStatusChange = (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => {
    setAthletesAttendance(prev => 
      prev.map(athlete => 
        athlete.id === athleteId ? { ...athlete, status } : athlete
      )
    );
  };

  const handleCreateSession = async () => {
    if (!modalidadeRepId) return;

    try {
      const attendances = athletesAttendance.map(athlete => ({
        atleta_id: athlete.id,
        status: athlete.status
      }));

      await createSessionWithAttendance.mutateAsync({
        modalidade_rep_id: modalidadeRepId,
        data_hora_inicio: sessionForm.data_hora_inicio,
        data_hora_fim: sessionForm.data_hora_fim || undefined,
        descricao: sessionForm.descricao || 'Chamada de presença',
        attendances
      });

      // Reset form and close dialog
      setSessionForm({ data_hora_inicio: '', data_hora_fim: '', descricao: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (athletesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-6xl mx-auto max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando atletas...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const canCreateSession = sessionForm.data_hora_inicio && athletes && athletes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Nova Chamada - {modalityName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2 max-h-[75vh] overflow-auto">
          {/* Formulário de configuração */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">Configuração da Chamada</h3>
            
            {/* Datas lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_hora_inicio">Data e Hora de Início *</Label>
                <Input
                  id="data_hora_inicio"
                  type="datetime-local"
                  value={sessionForm.data_hora_inicio}
                  onChange={(e) => setSessionForm({ ...sessionForm, data_hora_inicio: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_hora_fim">Data e Hora de Fim</Label>
                <Input
                  id="data_hora_fim"
                  type="datetime-local"
                  value={sessionForm.data_hora_fim}
                  onChange={(e) => setSessionForm({ ...sessionForm, data_hora_fim: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={sessionForm.descricao}
                onChange={(e) => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                placeholder="Descreva o objetivo desta chamada..."
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Lista de atletas e informações */}
          {athletes && athletes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} inscrito{athletes.length !== 1 ? 's' : ''} nesta modalidade
                </span>
              </div>
              
              <AthletesList athletes={athletes} />
            </div>
          )}

          {/* Seção de marcação de presenças */}
          {athletesAttendance.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Marcar Presenças</h3>
                <AttendanceStatusSummary athletesAttendance={athletesAttendance} />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {athletesAttendance.map((athlete) => (
                  <AthleteAttendanceCard
                    key={athlete.id}
                    athlete={athlete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-white">
            <Button 
              onClick={handleCreateSession}
              disabled={!canCreateSession || createSessionWithAttendance.isPending}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
            >
              {createSessionWithAttendance.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Criar Chamada
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
