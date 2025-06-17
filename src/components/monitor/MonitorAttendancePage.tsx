
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardCheck, Plus, Trash2, Users, Save, AlertCircle } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AttendanceSessionDetail from './AttendanceSessionDetail';
import { LoadingImage } from "@/components/ui/loading-image";

export default function MonitorAttendancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modalidadeParam = searchParams.get('modalidade');
  const [selectedModalidade, setSelectedModalidade] = useState<string | null>(
    modalidadeParam || null
  );
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: ''
  });

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions, isLoading: sessionsLoading } = useMonitorSessions(selectedModalidade || undefined);
  const { data: modalityAthletes, isLoading: athletesLoading } = useModalityAthletes(selectedModalidade || undefined);
  const { createSession, updateSession, deleteSession } = useMonitorMutations();

  useEffect(() => {
    if (modalidadeParam && modalities) {
      const exists = modalities.find(m => m.id === modalidadeParam);
      if (exists) {
        setSelectedModalidade(modalidadeParam);
      }
    }
  }, [modalidadeParam, modalities]);

  const handleCreateSession = async () => {
    if (!selectedModalidade || !sessionForm.data_hora_inicio) {
      return;
    }

    try {
      const newSession = await createSession.mutateAsync({
        modalidade_rep_id: selectedModalidade,
        data_hora_inicio: sessionForm.data_hora_inicio,
        data_hora_fim: sessionForm.data_hora_fim || undefined,
        descricao: sessionForm.descricao || 'Chamada de presença'
      });

      setIsNewSessionOpen(false);
      setSessionForm({ data_hora_inicio: '', data_hora_fim: '', descricao: '' });
      
      // Redirecionar automaticamente para a tela de presença
      if (newSession && newSession.id) {
        setSelectedSession(newSession.id);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta chamada?')) {
      await deleteSession.mutateAsync(sessionId);
    }
  };

  if (modalitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando modalidades..." />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-olimpics-green-primary" />
          <h1 className="text-xl sm:text-3xl font-bold text-olimpics-text">Chamadas de Presença</h1>
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-gray-500">
              Você não está cadastrado como monitor de nenhuma modalidade.
            </p>
            <Button onClick={() => navigate('/monitor/modalidades')} className="mt-4">
              Ver Minhas Modalidades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <AttendanceSessionDetail 
        sessionId={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  const selectedModalityData = modalities?.find(m => m.id === selectedModalidade);
  const hasAthletes = modalityAthletes && modalityAthletes.length > 0;
  const canCreateSession = selectedModalidade && hasAthletes && !athletesLoading;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-olimpics-green-primary" />
          <h1 className="text-xl sm:text-3xl font-bold text-olimpics-text">Chamadas de Presença</h1>
        </div>
      </div>

      {/* Seletor de Modalidade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Selecionar Modalidade</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={selectedModalidade || ''}
            onValueChange={(value) => setSelectedModalidade(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma modalidade" />
            </SelectTrigger>
            <SelectContent>
              {modalities.map((modality) => (
                <SelectItem key={modality.id} value={modality.id}>
                  <div className="flex flex-col">
                    <span>{modality.modalidades.nome}</span>
                    <span className="text-sm text-gray-500">{modality.filiais.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedModalidade && selectedModalityData && (
        <>
          {/* Header da Modalidade Selecionada */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl">{selectedModalityData.modalidades.nome}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedModalityData.filiais.nome} - {selectedModalityData.filiais.cidade}, {selectedModalityData.filiais.estado}
                  </p>
                  {athletesLoading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Verificando atletas inscritos...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4 text-olimpics-green-primary" />
                      <span className="text-sm text-gray-600">
                        {modalityAthletes?.length || 0} atleta{(modalityAthletes?.length || 0) !== 1 ? 's' : ''} inscrito{(modalityAthletes?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                
                <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
                      disabled={!canCreateSession}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Chamada de Presença
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Chamada de Presença</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      {!hasAthletes && !athletesLoading && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700">
                            Esta modalidade não possui atletas inscritos.
                          </span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="data_hora_inicio">Data e Hora de Início *</Label>
                        <Input
                          id="data_hora_inicio"
                          type="datetime-local"
                          value={sessionForm.data_hora_inicio}
                          onChange={(e) => setSessionForm({ ...sessionForm, data_hora_inicio: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="data_hora_fim">Data e Hora de Fim</Label>
                        <Input
                          id="data_hora_fim"
                          type="datetime-local"
                          value={sessionForm.data_hora_fim}
                          onChange={(e) => setSessionForm({ ...sessionForm, data_hora_fim: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição (opcional)</Label>
                        <Textarea
                          id="descricao"
                          value={sessionForm.descricao}
                          onChange={(e) => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                          placeholder="Descreva o objetivo desta chamada..."
                          className="w-full min-h-[80px] resize-none"
                        />
                      </div>
                      
                      {hasAthletes && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Todos os {modalityAthletes?.length} atletas serão automaticamente marcados como presentes.
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button 
                          onClick={handleCreateSession}
                          disabled={createSession.isPending || !sessionForm.data_hora_inicio || !canCreateSession}
                          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:flex-1"
                        >
                          {createSession.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Criar Chamada
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsNewSessionOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Lista de Chamadas */}
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingImage size="sm" text="Carregando chamadas..." />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold truncate">{session.descricao}</h3>
                          <Badge variant="outline" className="self-start sm:self-auto">
                            {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Badge>
                        </div>
                        {session.data_hora_fim && (
                          <p className="text-sm text-gray-500 mt-1">
                            Fim: {format(new Date(session.data_hora_fim), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSession(session.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Presenças</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deleteSession.isPending}
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-gray-500">Nenhuma chamada de presença criada ainda.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {canCreateSession 
                    ? 'Clique em "Nova Chamada de Presença" para criar sua primeira chamada.'
                    : 'Aguarde a inscrição de atletas para poder criar chamadas.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
