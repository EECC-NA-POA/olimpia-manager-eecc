
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useMonitorSessions, MonitorSession } from "@/hooks/useMonitorSessions";
import { LoadingImage } from "@/components/ui/loading-image";
import { useAuth } from "@/contexts/AuthContext";
import AttendanceCreationDialog from './AttendanceCreationDialog';
import EditAttendanceDialog from './EditAttendanceDialog';
import AttendanceSessionDetail from './AttendanceSessionDetail';
import SessionsListCard from './SessionsListCard';

export default function MonitorAttendancePage() {
  const [selectedModalidadeRepId, setSelectedModalidadeRepId] = useState<string | null>(null);
  const [selectedModalityName, setSelectedModalityName] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<MonitorSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { currentEventId, user } = useAuth();
  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions, isLoading: sessionsLoading } = useMonitorSessions(selectedModalidadeRepId || undefined);

  const handleModalitySelect = (modalidadeRepId: string, modalityName: string) => {
    setSelectedModalidadeRepId(modalidadeRepId);
    setSelectedModalityName(modalityName);
    setSelectedSessionId(null); // Reset session detail view
  };

  const handleCreateNewSession = () => {
    setShowCreateDialog(true);
  };

  const handleEditSession = (session: MonitorSession) => {
    setSelectedSessionForEdit(session);
    setShowEditDialog(true);
  };

  const handleViewSessionDetails = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleBackToSessions = () => {
    setSelectedSessionId(null);
  };

  if (modalitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando modalidades..." />
      </div>
    );
  }

  // Filter out modalities with null modalidades data
  const validModalities = modalities?.filter(modality => modality.modalidades && modality.modalidades.nome) || [];

  if (validModalities.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma modalidade encontrada</h3>
          <p className="text-gray-500">
            Você não está registrado como monitor de nenhuma modalidade.
          </p>
        </div>
      </div>
    );
  }

  // Se uma sessão específica foi selecionada, mostrar detalhes
  if (selectedSessionId) {
    return (
      <AttendanceSessionDetail
        sessionId={selectedSessionId}
        onBack={handleBackToSessions}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-olimpics-text">Controle de Presenças</h1>
        {selectedModalidadeRepId && (
          <Button
            onClick={handleCreateNewSession}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Chamada
          </Button>
        )}
      </div>

      {/* Seleção de Modalidade */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Modalidades como Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validModalities.map((modality) => (
              <Card
                key={modality.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedModalidadeRepId === modality.id ? 'ring-2 ring-olimpics-green-primary bg-green-50' : ''
                }`}
                onClick={() => handleModalitySelect(modality.id, modality.modalidades.nome)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-olimpics-text">{modality.modalidades.nome}</h3>
                  <p className="text-sm text-gray-500 mt-1">{modality.filiais.nome}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {modality.modalidades.categoria} • {modality.modalidades.tipo_modalidade}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Chamadas */}
      {selectedModalidadeRepId && (
        <Card>
          <CardHeader>
            <CardTitle>Chamadas - {selectedModalityName}</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando chamadas...</span>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <SessionsListCard
                    key={session.id}
                    session={session}
                    onViewDetails={handleViewSessionDetails}
                    onEditSession={handleEditSession}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma chamada encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Ainda não há chamadas registradas para esta modalidade.
                </p>
                <Button
                  onClick={handleCreateNewSession}
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Chamada
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogos */}
      <AttendanceCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        modalidadeRepId={selectedModalidadeRepId}
        modalityName={selectedModalityName}
      />

      {selectedSessionForEdit && (
        <EditAttendanceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          session={selectedSessionForEdit}
        />
      )}
    </div>
  );
}
