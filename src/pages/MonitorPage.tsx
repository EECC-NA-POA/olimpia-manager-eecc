
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Users } from "lucide-react";
import SessionsListCard from "@/components/monitor/SessionsListCard";
import MonitorReportsPage from "@/components/monitor/MonitorReportsPage";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useUserModalityReps } from "@/hooks/useUserModalityReps";
import { useNavigate } from 'react-router-dom';

export default function MonitorPage() {
  const navigate = useNavigate();
  const [selectedModalityRep, setSelectedModalityRep] = useState<string>("");
  const { data: modalityReps, isLoading: modalityRepsLoading } = useUserModalityReps();
  const { data: sessions, isLoading } = useMonitorSessions(selectedModalityRep);

  const handleViewDetails = (sessionId: string) => {
    navigate(`/monitor/session/${sessionId}`);
  };

  const handleEditSession = (session: any) => {
    // Implementar edição de sessão se necessário
    console.log('Edit session:', session);
  };

  // Automaticamente selecionar a primeira modalidade representante se houver
  React.useEffect(() => {
    if (modalityReps && modalityReps.length > 0 && !selectedModalityRep) {
      setSelectedModalityRep(modalityReps[0].id);
    }
  }, [modalityReps, selectedModalityRep]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-olimpics-green-primary" />
        <h1 className="text-3xl font-bold text-olimpics-text">Monitor de Chamadas</h1>
      </div>

      {modalityRepsLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Carregando representações de modalidade...</p>
          </CardContent>
        </Card>
      ) : !modalityReps || modalityReps.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Acesso não autorizado</h3>
            <p className="text-gray-500">Você não está registrado como monitor de nenhuma modalidade</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {modalityReps.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Selecione uma Modalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {modalityReps.map((rep) => (
                    <Card
                      key={rep.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedModalityRep === rep.id ? 'ring-2 ring-olimpics-green-primary bg-green-50' : ''
                      }`}
                      onClick={() => setSelectedModalityRep(rep.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-olimpics-text">{rep.modalidades?.nome}</h3>
                        <p className="text-sm text-gray-500 mt-1">{rep.filiais?.nome}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="sessions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Chamadas
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Carregando chamadas...</p>
                  </CardContent>
                </Card>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <SessionsListCard
                      key={session.id}
                      session={session}
                      onViewDetails={handleViewDetails}
                      onEditSession={handleEditSession}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma chamada encontrada</h3>
                    <p className="text-gray-500">Não há chamadas disponíveis no momento</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reports">
              <MonitorReportsPage />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
