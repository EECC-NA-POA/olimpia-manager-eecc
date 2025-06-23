
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
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <div className="text-center py-6 sm:py-8">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma modalidade encontrada</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold text-olimpics-text">Controle de Presenças</h1>
        {selectedModalidadeRepId && (
          <Button
            onClick={handleCreateNewSession}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Chamada
          </Button>
        )}
      </div>

      {/* Seleção de Modalidade */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Suas Modalidades como Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {validModalities.map((modality) => (
              <Card
                key={modality.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedModalidadeRepId === modality.id ? 'ring-2 ring-olimpics-green-primary bg-green-50' : ''
                }`}
                onClick={() => handleModalitySelect(modality.id, modality.modalidades.nome)}
              >
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-olimpics-text line-clamp-2">{modality.modalidades.nome}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">{modality.filiais.nome}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 line-clamp-1">
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
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg line-clamp-2">Chamadas - {selectedModalityName}</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Carregando chamadas...</span>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
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
              <div className="text-center py-6 sm:py-8">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma chamada encontrada</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
                  Ainda não há chamadas registradas para esta modalidade.
                </p>
                <Button
                  onClick={handleCreateNewSession}
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-sm"
                  size="sm"
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
