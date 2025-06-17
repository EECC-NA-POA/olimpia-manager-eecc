
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Users, AlertTriangle, UserPlus } from "lucide-react";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { useSessionAttendance, useAthletesForAttendance } from "@/hooks/useSessionAttendance";
import { MonitorSession } from "@/hooks/useMonitorSessions";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AttendanceStatusSummary from './attendance-creation/AttendanceStatusSummary';
import AthleteAttendanceCard from './attendance-creation/AthleteAttendanceCard';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: MonitorSession;
}

interface AthleteAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status: 'presente' | 'ausente' | 'atrasado';
}

export default function EditAttendanceDialog({ 
  open, 
  onOpenChange, 
  session 
}: EditAttendanceDialogProps) {
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: '',
    observacoes: ''
  });
  const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);

  const { data: existingAttendances } = useSessionAttendance(session.id);
  const { data: athletes, isLoading: athletesLoading } = useAthletesForAttendance(session.modalidade_rep_id);
  const { updateSession, saveAttendances } = useMonitorMutations();

  useEffect(() => {
    if (session && open) {
      setSessionForm({
        data_hora_inicio: format(new Date(session.data_hora_inicio), "yyyy-MM-dd'T'HH:mm"),
        data_hora_fim: session.data_hora_fim ? format(new Date(session.data_hora_fim), "yyyy-MM-dd'T'HH:mm") : '',
        descricao: session.descricao || '',
        observacoes: (session as any).observacoes || ''
      });
    }
  }, [session, open]);

  useEffect(() => {
    if (athletes && open) {
      // Criar mapa das presenças existentes
      const existingAttendanceMap = new Map();
      existingAttendances?.forEach(attendance => {
        existingAttendanceMap.set(attendance.atleta_id, attendance.status);
      });

      // Incluir TODOS os atletas inscritos na modalidade, não apenas os que já têm presença registrada
      const allAthletesAttendance = athletes.map(athlete => ({
        id: athlete.id,
        nome_completo: athlete.nome_completo,
        email: athlete.email,
        numero_identificador: athlete.numero_identificador,
        status: existingAttendanceMap.get(athlete.id) || 'presente' as const
      }));
      
      setAthletesAttendance(allAthletesAttendance);
    }
  }, [athletes, existingAttendances, open]);

  const handleStatusChange = (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => {
    setAthletesAttendance(prev => 
      prev.map(athlete => 
        athlete.id === athleteId ? { ...athlete, status } : athlete
      )
    );
  };

  const handleUpdateSession = async () => {
    try {
      // Atualizar dados da sessão
      await updateSession.mutateAsync({
        id: session.id,
        data: {
          data_hora_inicio: sessionForm.data_hora_inicio,
          data_hora_fim: sessionForm.data_hora_fim || undefined,
          descricao: sessionForm.descricao,
          observacoes: sessionForm.observacoes
        }
      });

      // Salvar presenças atualizadas para TODOS os atletas
      if (athletesAttendance.length > 0) {
        const attendances = athletesAttendance.map(athlete => ({
          chamada_id: session.id,
          atleta_id: athlete.id,
          status: athlete.status
        }));

        await saveAttendances.mutateAsync(attendances);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating session:', error);
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

  const canUpdateSession = sessionForm.data_hora_inicio && sessionForm.descricao;
  
  // Atletas que se inscreveram após a criação da chamada
  const newAthletes = athletesAttendance.filter(athlete => 
    !existingAttendances?.some(existing => existing.atleta_id === athlete.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Chamada - {session.modalidade_representantes.modalidades.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2 max-h-[75vh] overflow-auto">
          {/* Formulário de configuração */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">Dados da Chamada</h3>
            
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
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={sessionForm.descricao}
                onChange={(e) => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                placeholder="Descreva o objetivo desta chamada..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={sessionForm.observacoes}
                onChange={(e) => setSessionForm({ ...sessionForm, observacoes: e.target.value })}
                placeholder="Registre aqui nomes de atletas que compareceram mas ainda não têm cadastro no sistema, ou outras observações importantes..."
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Use este campo para registrar atletas presentes que ainda não possuem cadastro no sistema
              </p>
            </div>
          </div>

          {/* Alerta sobre observações se houver */}
          {sessionForm.observacoes && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Observações registradas:</strong> {sessionForm.observacoes}
                <br />
                <span className="text-sm">Lembre-se de atualizar a chamada quando estes atletas realizarem o cadastro no sistema.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Informação sobre novos atletas */}
          {newAthletes.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>{newAthletes.length} novo(s) atleta(s) encontrado(s)!</strong>
                <br />
                <span className="text-sm">Atletas que se inscreveram após a criação desta chamada serão automaticamente incluídos.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Informação de atletas inscritos */}
          {athletes && athletes.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} inscrito{athletes.length !== 1 ? 's' : ''} nesta modalidade
              </span>
            </div>
          )}

          {/* Seção de marcação de presenças */}
          {athletesAttendance.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Atualizar Presenças</h3>
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
              onClick={handleUpdateSession}
              disabled={!canUpdateSession || updateSession.isPending || saveAttendances.isPending}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
            >
              {(updateSession.isPending || saveAttendances.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
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
