
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, Edit, AlertTriangle } from "lucide-react";
import { useSessionAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { LoadingImage } from "@/components/ui/loading-image";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceSessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export default function AttendanceSessionDetail({ sessionId, onBack }: AttendanceSessionDetailProps) {
  const { data: attendances, isLoading: attendancesLoading } = useSessionAttendance(sessionId);

  if (attendancesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando detalhes da chamada..." />
      </div>
    );
  }

  const session = attendances?.[0]?.chamada;
  
  if (!session && !attendancesLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chamada não encontrada</h3>
          <p className="text-gray-500">
            Não foi possível carregar os detalhes desta chamada.
          </p>
        </div>
      </div>
    );
  }

  const presentes = attendances?.filter(a => a.status === 'presente') || [];
  const ausentes = attendances?.filter(a => a.status === 'ausente') || [];
  const atrasados = attendances?.filter(a => a.status === 'atrasado') || [];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-olimpics-text">Detalhes da Chamada</h1>
          {session && (
            <p className="text-gray-500">
              {session.modalidade_representantes?.modalidades?.nome} • {session.modalidade_representantes?.filiais?.nome}
            </p>
          )}
        </div>
      </div>

      {/* Session Info */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{session.descricao}</span>
              <Badge variant="outline">
                {session.modalidade_representantes?.modalidades?.nome}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(session.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                  {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {session.modalidade_representantes?.filiais?.nome}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {attendances?.length || 0} atleta(s) registrado(s)
                </span>
              </div>
            </div>

            {session.observacoes && (
              <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800">Observações importantes:</p>
                    <p className="text-sm text-amber-700 mt-1 break-words">{session.observacoes}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-olimpics-green-primary">{attendances?.length || 0}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{presentes.length}</div>
            <div className="text-sm text-gray-500">Presentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{atrasados.length}</div>
            <div className="text-sm text-gray-500">Atrasados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{ausentes.length}</div>
            <div className="text-sm text-gray-500">Ausentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Presentes */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              Presentes ({presentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {presentes.map((attendance) => (
                <div key={attendance.id} className="p-2 bg-green-50 rounded-lg">
                  <div className="font-medium text-sm">{attendance.atleta.nome_completo}</div>
                  <div className="text-xs text-gray-500">{attendance.atleta.email}</div>
                  {attendance.atleta.numero_identificador && (
                    <Badge variant="outline" className="text-xs mt-1">
                      ID: {attendance.atleta.numero_identificador}
                    </Badge>
                  )}
                </div>
              ))}
              {presentes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum atleta presente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atrasados */}
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              Atrasados ({atrasados.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {atrasados.map((attendance) => (
                <div key={attendance.id} className="p-2 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-sm">{attendance.atleta.nome_completo}</div>
                  <div className="text-xs text-gray-500">{attendance.atleta.email}</div>
                  {attendance.atleta.numero_identificador && (
                    <Badge variant="outline" className="text-xs mt-1">
                      ID: {attendance.atleta.numero_identificador}
                    </Badge>
                  )}
                </div>
              ))}
              {atrasados.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum atleta atrasado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ausentes */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              Ausentes ({ausentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ausentes.map((attendance) => (
                <div key={attendance.id} className="p-2 bg-red-50 rounded-lg">
                  <div className="font-medium text-sm">{attendance.atleta.nome_completo}</div>
                  <div className="text-xs text-gray-500">{attendance.atleta.email}</div>
                  {attendance.atleta.numero_identificador && (
                    <Badge variant="outline" className="text-xs mt-1">
                      ID: {attendance.atleta.numero_identificador}
                    </Badge>
                  )}
                </div>
              ))}
              {ausentes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum atleta ausente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
