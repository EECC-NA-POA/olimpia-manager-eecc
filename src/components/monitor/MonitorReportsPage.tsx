
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Users, UserCheck, UserX, Clock, Printer } from "lucide-react";
import { useUserModalityReps } from "@/hooks/useUserModalityReps";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useSessionAttendance } from "@/hooks/useSessionAttendance";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MonitorReportsPage() {
  const [selectedModalityRep, setSelectedModalityRep] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  
  const { data: modalityReps, isLoading: loadingReps } = useUserModalityReps();
  const { data: sessions, isLoading: loadingSessions } = useMonitorSessions(selectedModalityRep);
  const { data: attendances, isLoading: loadingAttendances } = useSessionAttendance(selectedSession || null);

  const handlePrint = () => {
    window.print();
  };

  const generateCSV = () => {
    if (!attendances || attendances.length === 0) return;

    const headers = ['Nome', 'Email', 'Número Identificador', 'Status', 'Data da Chamada'];
    const csvData = attendances.map(attendance => [
      attendance.atleta.nome_completo,
      attendance.atleta.email,
      attendance.atleta.numero_identificador || 'N/A',
      attendance.status,
      attendance.chamada?.data_hora_inicio ? format(new Date(attendance.chamada.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_presenca_${selectedSession}.csv`;
    link.click();
  };

  const selectedSessionData = sessions?.find(s => s.id === selectedSession);
  const presente = attendances?.filter(a => a.status === 'presente').length || 0;
  const ausente = attendances?.filter(a => a.status === 'ausente').length || 0;
  const atrasado = attendances?.filter(a => a.status === 'atrasado').length || 0;
  const total = attendances?.length || 0;

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area,
            .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              margin: 2cm;
            }
          }
        `}
      </style>

      <div className="flex items-center gap-3 no-print">
        <FileText className="h-8 w-8 text-olimpics-green-primary" />
        <h1 className="text-3xl font-bold text-olimpics-text">Relatórios de Presença</h1>
      </div>

      {/* Filtros */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Modalidade</label>
              <Select 
                value={selectedModalityRep} 
                onValueChange={(value) => {
                  setSelectedModalityRep(value);
                  setSelectedSession(""); // Reset session when modality changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalityReps?.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id}>
                      {rep.modalidades.nome} - {rep.filiais.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chamada</label>
              <Select 
                value={selectedSession} 
                onValueChange={setSelectedSession}
                disabled={!selectedModalityRep || loadingSessions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma chamada" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.descricao} - {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSession && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button
                onClick={generateCSV}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!attendances || attendances.length === 0}
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatório */}
      {selectedSession && selectedSessionData && (
        <div className="print-area space-y-6">
          {/* Cabeçalho do Relatório */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Relatório de Presença - {selectedSessionData.descricao}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{format(new Date(selectedSessionData.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {format(new Date(selectedSessionData.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                    {selectedSessionData.data_hora_fim && ` - ${format(new Date(selectedSessionData.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{selectedSessionData.modalidade_representantes?.filiais?.nome}</span>
                </div>
              </div>
              
              <Badge variant="outline" className="text-sm">
                {selectedSessionData.modalidade_representantes?.modalidades?.nome}
              </Badge>
            </CardContent>
          </Card>

          {/* Resumo Estatístico */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-olimpics-green-primary">{total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{presente}</div>
                <div className="text-sm text-gray-500">Presentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{atrasado}</div>
                <div className="text-sm text-gray-500">Atrasados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{ausente}</div>
                <div className="text-sm text-gray-500">Ausentes</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Presenças</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAttendances ? (
                <div className="text-center py-8">
                  <p>Carregando dados de presença...</p>
                </div>
              ) : attendances && attendances.length > 0 ? (
                <div className="space-y-3">
                  {attendances.map((attendance, index) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-8">{index + 1}</span>
                        <div className="flex-1">
                          <div className="font-medium">{attendance.atleta.nome_completo}</div>
                          <div className="text-sm text-gray-500">{attendance.atleta.email}</div>
                          {attendance.atleta.numero_identificador && (
                            <Badge variant="outline" className="text-xs mt-1">
                              ID: {attendance.atleta.numero_identificador}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {attendance.status === 'presente' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Presente
                          </Badge>
                        )}
                        {attendance.status === 'atrasado' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Atrasado
                          </Badge>
                        )}
                        {attendance.status === 'ausente' && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <UserX className="h-3 w-3 mr-1" />
                            Ausente
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma presença registrada para esta chamada
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações da Chamada */}
          {(selectedSessionData as any).observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{(selectedSessionData as any).observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {!selectedModalityRep && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Selecione uma modalidade</h3>
            <p className="text-gray-500">Escolha uma modalidade acima para visualizar os relatórios de presença</p>
          </CardContent>
        </Card>
      )}

      {selectedModalityRep && !selectedSession && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Selecione uma chamada</h3>
            <p className="text-gray-500">Escolha uma chamada específica para gerar o relatório</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
