
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ClipboardCheck, Plus, Trash2, Users } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AttendanceSessionDetail from './AttendanceSessionDetail';
import AttendanceCreationDialog from './AttendanceCreationDialog';
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

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions, isLoading: sessionsLoading } = useMonitorSessions(selectedModalidade || undefined);
  const { data: modalityAthletes, isLoading: athletesLoading } = useModalityAthletes(selectedModalidade || undefined);
  const { deleteSession } = useMonitorMutations();

  useEffect(() => {
    if (modalidadeParam && modalities) {
      const exists = modalities.find(m => m.id === modalidadeParam);
      if (exists) {
        setSelectedModalidade(modalidadeParam);
      }
    }
  }, [modalidadeParam, modalities]);

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
          <h1 className="text-xl sm:text-3xl font-bold text-olimpics-text">Chamadas</h1>
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
          <h1 className="text-xl sm:text-3xl font-bold text-olimpics-text">Chamadas</h1>
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
                
                <Button 
                  onClick={() => setIsNewSessionOpen(true)}
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
                  disabled={!canCreateSession}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Chamada
                </Button>
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
                <p className="text-gray-500">Nenhuma chamada criada ainda.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {canCreateSession 
                    ? 'Clique em "Nova Chamada" para criar sua primeira chamada.'
                    : 'Aguarde a inscrição de atletas para poder criar chamadas.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AttendanceCreationDialog
        open={isNewSessionOpen}
        onOpenChange={setIsNewSessionOpen}
        modalidadeRepId={selectedModalidade}
        modalityName={selectedModalityData?.modalidades.nome || ''}
      />
    </div>
  );
}
