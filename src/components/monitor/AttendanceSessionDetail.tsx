import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Save, Users } from "lucide-react";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useSessionAttendance, useAthletesForAttendance, AthleteForAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceSessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export default function AttendanceSessionDetail({ sessionId, onBack }: AttendanceSessionDetailProps) {
  const [attendanceData, setAttendanceData] = useState<Map<string, { status: string; attendance_id?: string }>>(new Map());
  const [modalidadeRepId, setModalidadeRepId] = useState<string | null>(null);

  // Buscar dados da sessão
  const { data: sessions } = useMonitorSessions(modalidadeRepId);
  const session = sessions?.find(s => s.id === sessionId);

  // Buscar presenças existentes
  const { data: existingAttendances, isLoading: attendancesLoading } = useSessionAttendance(sessionId);
  
  // Buscar atletas elegíveis
  const { data: athletes, isLoading: athletesLoading } = useAthletesForAttendance(modalidadeRepId);
  
  const { saveAttendances } = useMonitorMutations();

  // Atualizar modalidadeRepId quando a sessão for carregada
  useEffect(() => {
    if (session) {
      setModalidadeRepId(session.modalidade_rep_id);
    }
  }, [session]);

  // Inicializar dados de presença quando os dados chegarem
  useEffect(() => {
    if (existingAttendances && athletes) {
      const newAttendanceData = new Map();
      
      // Primeiro, inicializar todos os atletas com status 'ausente'
      athletes.forEach(athlete => {
        newAttendanceData.set(athlete.id, {
          status: 'ausente',
          attendance_id: undefined
        });
      });
      
      // Depois, atualizar com os dados existentes
      existingAttendances.forEach(attendance => {
        newAttendanceData.set(attendance.atleta_id, {
          status: attendance.status,
          attendance_id: attendance.id
        });
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [existingAttendances, athletes]);

  const handleStatusChange = (athleteId: string, status: string) => {
    const current = attendanceData.get(athleteId) || { status: 'ausente' };
    setAttendanceData(new Map(attendanceData.set(athleteId, { ...current, status })));
  };

  const handleSaveAttendances = async () => {
    if (!athletes) return;

    const attendancesToSave = athletes.map(athlete => {
      const data = attendanceData.get(athlete.id) || { status: 'ausente' };
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
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-olimpics-text">Presença - {session.descricao}</h1>
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

  const getStatusBadge = (status: string) => {
    const colors = {
      presente: 'bg-green-100 text-green-800 border-green-200',
      ausente: 'bg-red-100 text-red-800 border-red-200',
      atrasado: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status as keyof typeof colors] || colors.ausente;
  };

  const getStatusCounts = () => {
    if (!athletes) return { presente: 0, ausente: 0, atrasado: 0, total: 0 };
    
    let presente = 0, ausente = 0, atrasado = 0;
    
    athletes.forEach(athlete => {
      const data = attendanceData.get(athlete.id);
      if (data) {
        switch (data.status) {
          case 'presente': presente++; break;
          case 'atrasado': atrasado++; break;
          default: ausente++; break;
        }
      } else {
        ausente++;
      }
    });
    
    return { presente, ausente, atrasado, total: athletes.length };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-olimpics-text">{session.descricao}</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveAttendances}
          disabled={saveAttendances.isPending}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-olimpics-green-primary">{counts.total}</div>
            <div className="text-sm text-gray-500">Total de Atletas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{counts.presente}</div>
            <div className="text-sm text-gray-500">Presentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{counts.atrasado}</div>
            <div className="text-sm text-gray-500">Atrasados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{counts.ausente}</div>
            <div className="text-sm text-gray-500">Ausentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Atletas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Presença
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athletes.map((athlete) => {
                const data = attendanceData.get(athlete.id) || { status: 'ausente' };
                return (
                  <TableRow key={athlete.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{athlete.nome_completo}</div>
                        <div className="text-sm text-gray-500">{athlete.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {athlete.numero_identificador || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={data.status}
                        onValueChange={(value) => handleStatusChange(athlete.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presente">
                            <Badge className={getStatusBadge('presente')}>Presente</Badge>
                          </SelectItem>
                          <SelectItem value="atrasado">
                            <Badge className={getStatusBadge('atrasado')}>Atrasado</Badge>
                          </SelectItem>
                          <SelectItem value="ausente">
                            <Badge className={getStatusBadge('ausente')}>Ausente</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
