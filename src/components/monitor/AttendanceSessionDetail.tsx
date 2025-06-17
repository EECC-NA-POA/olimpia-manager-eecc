
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, Users, UserCheck, UserX, Clock } from "lucide-react";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useSessionAttendance, useAthletesForAttendance, AthleteForAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingImage } from "@/components/ui/loading-image";

interface AttendanceSessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export default function AttendanceSessionDetail({ sessionId, onBack }: AttendanceSessionDetailProps) {
  const [attendanceData, setAttendanceData] = useState<Map<string, { status: string; attendance_id?: string }>>(new Map());
  const [modalidadeRepId, setModalidadeRepId] = useState<string | null>(null);

  const { data: sessions } = useMonitorSessions(modalidadeRepId);
  const session = sessions?.find(s => s.id === sessionId);

  const { data: existingAttendances, isLoading: attendancesLoading } = useSessionAttendance(sessionId);
  const { data: athletes, isLoading: athletesLoading } = useAthletesForAttendance(modalidadeRepId);
  
  const { saveAttendances } = useMonitorMutations();

  useEffect(() => {
    if (session) {
      setModalidadeRepId(session.modalidade_rep_id);
    }
  }, [session]);

  useEffect(() => {
    if (existingAttendances && athletes) {
      const newAttendanceData = new Map();
      
      // Primeiro, inicializar todos os atletas com status 'presente' (padrão)
      athletes.forEach(athlete => {
        newAttendanceData.set(athlete.id, {
          status: 'presente',
          attendance_id: undefined
        });
      });
      
      // Depois, atualizar com os dados existentes se houver
      existingAttendances.forEach(attendance => {
        newAttendanceData.set(attendance.atleta_id, {
          status: attendance.status,
          attendance_id: attendance.id
        });
      });
      
      setAttendanceData(newAttendanceData);
    } else if (athletes && !existingAttendances) {
      // Se não há dados existentes, inicializar todos como presente
      const newAttendanceData = new Map();
      athletes.forEach(athlete => {
        newAttendanceData.set(athlete.id, {
          status: 'presente',
          attendance_id: undefined
        });
      });
      setAttendanceData(newAttendanceData);
    }
  }, [existingAttendances, athletes]);

  const handleStatusChange = (athleteId: string, status: string) => {
    const current = attendanceData.get(athleteId) || { status: 'presente' };
    setAttendanceData(new Map(attendanceData.set(athleteId, { ...current, status })));
  };

  const handleSaveAttendances = async () => {
    if (!athletes) return;

    const attendancesToSave = athletes.map(athlete => {
      const data = attendanceData.get(athlete.id) || { status: 'presente' };
      return {
        chamada_id: sessionId,
        atleta_id: athlete.id,
        status: data.status as 'presente' | 'ausente' | 'atrasado'
      };
    });

    await saveAttendances.mutateAsync(attendancesToSave);
  };

  if (attendancesLoading || athletesLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando chamada de presença..." />
      </div>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-olimpics-text">{session.descricao}</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Nenhum atleta inscrito encontrado para esta modalidade.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusCounts = () => {
    if (!athletes) return { presente: 0, ausente: 0, atrasado: 0, total: 0 };
    
    let presente = 0, ausente = 0, atrasado = 0;
    
    athletes.forEach(athlete => {
      const data = attendanceData.get(athlete.id);
      if (data) {
        switch (data.status) {
          case 'presente': presente++; break;
          case 'atrasado': atrasado++; break;
          case 'ausente': ausente++; break;
          default: presente++; break;
        }
      } else {
        presente++;
      }
    });
    
    return { presente, ausente, atrasado, total: athletes.length };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button variant="outline" onClick={onBack} size="sm" className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-olimpics-text truncate">{session.descricao}</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveAttendances}
          disabled={saveAttendances.isPending}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
          size="sm"
        >
          {saveAttendances.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Presenças
        </Button>
      </div>

      {/* Resumo de Presenças */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-olimpics-green-primary">{counts.total}</div>
            <div className="text-xs sm:text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{counts.presente}</div>
            <div className="text-xs sm:text-sm text-gray-500">Presentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{counts.atrasado}</div>
            <div className="text-xs sm:text-sm text-gray-500">Atrasados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{counts.ausente}</div>
            <div className="text-xs sm:text-sm text-gray-500">Ausentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atletas Mobile-Friendly */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Lista de Presença ({athletes.length} atletas)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {athletes.map((athlete) => {
              const data = attendanceData.get(athlete.id) || { status: 'presente' };
              return (
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
                        variant={data.status === 'presente' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(athlete.id, 'presente')}
                        className={`flex-1 sm:flex-none ${data.status === 'presente' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Presente</span>
                        <span className="sm:hidden">P</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={data.status === 'atrasado' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(athlete.id, 'atrasado')}
                        className={`flex-1 sm:flex-none ${data.status === 'atrasado' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Atrasado</span>
                        <span className="sm:hidden">A</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={data.status === 'ausente' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(athlete.id, 'ausente')}
                        className={`flex-1 sm:flex-none ${data.status === 'ausente' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ausente</span>
                        <span className="sm:hidden">F</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
