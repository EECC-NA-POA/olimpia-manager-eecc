
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Users, UserCheck, UserX, Clock, ArrowLeft } from "lucide-react";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";

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
  const [step, setStep] = useState<'form' | 'attendance'>('form');
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: ''
  });
  const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);

  const { data: athletes, isLoading: athletesLoading } = useModalityAthletes(modalidadeRepId || undefined);
  const { createSessionWithAttendance } = useMonitorMutations();

  useEffect(() => {
    if (athletes && step === 'attendance') {
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
  }, [athletes, step]);

  const handleNext = () => {
    if (!sessionForm.data_hora_inicio) {
      return;
    }
    setStep('attendance');
  };

  const handleBack = () => {
    setStep('form');
  };

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
      setStep('form');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getStatusCounts = () => {
    const presente = athletesAttendance.filter(a => a.status === 'presente').length;
    const ausente = athletesAttendance.filter(a => a.status === 'ausente').length;
    const atrasado = athletesAttendance.filter(a => a.status === 'atrasado').length;
    return { presente, ausente, atrasado, total: athletesAttendance.length };
  };

  if (athletesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando atletas...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Nova Chamada' : 'Marcar Presenças'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-4 py-2 max-h-[70vh] overflow-auto">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Input
                value={modalityName}
                disabled
                className="bg-gray-100"
              />
            </div>

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

            {/* Lista de Atletas Inscritos */}
            {athletes && athletes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} inscrito{athletes.length !== 1 ? 's' : ''} nesta modalidade:
                  </span>
                </div>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lista de Atletas</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {athletes.map((athlete, index) => (
                        <div key={athlete.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{athlete.nome_completo}</div>
                            <div className="text-xs text-gray-500 truncate">{athlete.email}</div>
                          </div>
                          {athlete.numero_identificador && (
                            <Badge variant="outline" className="text-xs ml-2">
                              ID: {athlete.numero_identificador}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleNext}
                disabled={!sessionForm.data_hora_inicio || !athletes || athletes.length === 0}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
              >
                Próximo: Marcar Presenças
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[70vh] overflow-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold">{sessionForm.descricao || 'Chamada de presença'}</h3>
                <p className="text-sm text-gray-500">{modalityName}</p>
              </div>
            </div>

            {/* Resumo de Presenças */}
            {athletesAttendance.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {(() => {
                  const counts = getStatusCounts();
                  return (
                    <>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-olimpics-green-primary">{counts.total}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-green-600">{counts.presente}</div>
                          <div className="text-xs text-gray-500">Presentes</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-yellow-600">{counts.atrasado}</div>
                          <div className="text-xs text-gray-500">Atrasados</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-red-600">{counts.ausente}</div>
                          <div className="text-xs text-gray-500">Ausentes</div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Lista de Atletas */}
            <div className="space-y-3">
              {athletesAttendance.map((athlete) => (
                <div key={athlete.id} className="border rounded-lg p-3 bg-gray-50">
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
                        onClick={() => handleStatusChange(athlete.id, 'presente')}
                        className={athlete.status === 'presente' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Presente</span>
                        <span className="sm:hidden">P</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={athlete.status === 'atrasado' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(athlete.id, 'atrasado')}
                        className={athlete.status === 'atrasado' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Atrasado</span>
                        <span className="sm:hidden">A</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={athlete.status === 'ausente' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(athlete.id, 'ausente')}
                        className={athlete.status === 'ausente' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ausente</span>
                        <span className="sm:hidden">F</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleCreateSession}
                disabled={createSessionWithAttendance.isPending}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
              >
                {createSessionWithAttendance.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Criar Chamada
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
