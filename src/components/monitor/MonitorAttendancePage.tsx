
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardCheck, Plus, Edit, Trash2, Users, Save } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AttendanceSessionDetail from './AttendanceSessionDetail';

export default function MonitorAttendancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modalidadeParam = searchParams.get('modalidade');
  const [selectedModalidade, setSelectedModalidade] = useState<number | null>(
    modalidadeParam ? parseInt(modalidadeParam) : null
  );
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: ''
  });

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions, isLoading: sessionsLoading } = useMonitorSessions(selectedModalidade || undefined);
  const { createSession, updateSession, deleteSession } = useMonitorMutations();

  useEffect(() => {
    if (modalidadeParam && modalities) {
      const modalidadeId = parseInt(modalidadeParam);
      const exists = modalities.find(m => m.id === modalidadeId);
      if (exists) {
        setSelectedModalidade(modalidadeId);
      }
    }
  }, [modalidadeParam, modalities]);

  const handleCreateSession = async () => {
    if (!selectedModalidade || !sessionForm.data_hora_inicio || !sessionForm.descricao) {
      return;
    }

    await createSession.mutateAsync({
      modalidade_rep_id: selectedModalidade,
      data_hora_inicio: sessionForm.data_hora_inicio,
      data_hora_fim: sessionForm.data_hora_fim || undefined,
      descricao: sessionForm.descricao
    });

    setIsNewSessionOpen(false);
    setSessionForm({ data_hora_inicio: '', data_hora_fim: '', descricao: '' });
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      await deleteSession.mutateAsync(sessionId);
    }
  };

  if (modalitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-3xl font-bold text-olimpics-text">Chamadas de Presença</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
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

  const selectedModalityData = modalities.find(m => m.id === selectedModalidade);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-3xl font-bold text-olimpics-text">Chamadas de Presença</h1>
        </div>
      </div>

      {/* Seletor de Modalidade */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Modalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedModalidade?.toString() || ''}
            onValueChange={(value) => setSelectedModalidade(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma modalidade" />
            </SelectTrigger>
            <SelectContent>
              {modalities.map((modality) => (
                <SelectItem key={modality.id} value={modality.id.toString()}>
                  {modality.modalidades.nome} - {modality.filiais.nome}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedModalityData.modalidades.nome}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {selectedModalityData.filiais.nome} - {selectedModalityData.filiais.cidade}, {selectedModalityData.filiais.estado}
                  </p>
                </div>
                
                <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Chamada
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Sessão de Presença</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="data_hora_inicio">Data e Hora de Início *</Label>
                        <Input
                          id="data_hora_inicio"
                          type="datetime-local"
                          value={sessionForm.data_hora_inicio}
                          onChange={(e) => setSessionForm({ ...sessionForm, data_hora_inicio: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="data_hora_fim">Data e Hora de Fim</Label>
                        <Input
                          id="data_hora_fim"
                          type="datetime-local"
                          value={sessionForm.data_hora_fim}
                          onChange={(e) => setSessionForm({ ...sessionForm, data_hora_fim: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Textarea
                          id="descricao"
                          value={sessionForm.descricao}
                          onChange={(e) => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                          placeholder="Descreva o objetivo desta sessão..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCreateSession}
                          disabled={createSession.isPending}
                          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                        >
                          {createSession.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Criar Sessão
                        </Button>
                        <Button variant="outline" onClick={() => setIsNewSessionOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Lista de Sessões */}
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-olimpics-green-primary" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{session.descricao}</h3>
                          <Badge variant="outline">
                            {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Badge>
                        </div>
                        {session.data_hora_fim && (
                          <p className="text-sm text-gray-500 mt-1">
                            Fim: {format(new Date(session.data_hora_fim), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSession(session.id)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Presenças
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deleteSession.isPending}
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
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Nenhuma sessão de presença criada ainda.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Clique em "Nova Chamada" para criar sua primeira sessão.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
