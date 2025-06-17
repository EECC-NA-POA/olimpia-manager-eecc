
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceReport {
  session_date: string;
  session_description: string;
  total_athletes: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number;
}

interface AthleteAttendanceStats {
  athlete_id: string;
  athlete_name: string;
  athlete_identifier: string;
  total_sessions: number;
  present_sessions: number;
  late_sessions: number;
  absent_sessions: number;
  attendance_rate: number;
}

export default function MonitorReportsPage() {
  const [selectedModalidade, setSelectedModalidade] = useState<number | null>(null);

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions } = useMonitorSessions(selectedModalidade || undefined);

  // Buscar relatório de presenças por sessão
  const { data: sessionReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['attendance-reports', selectedModalidade],
    queryFn: async () => {
      if (!selectedModalidade) return [];

      const { data, error } = await supabase
        .from('chamadas')
        .select(`
          id,
          data_hora_inicio,
          descricao,
          chamada_presencas (
            status,
            atleta_id
          )
        `)
        .eq('modalidade_rep_id', selectedModalidade)
        .order('data_hora_inicio', { ascending: true });

      if (error) throw error;

      // Buscar total de atletas inscritos
      const { data: modalidadeData } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id, evento_id')
        .eq('id', selectedModalidade)
        .single();

      if (!modalidadeData) return [];

      const { data: athletesData } = await supabase
        .from('inscricoes_modalidades')
        .select('atleta_id')
        .eq('modalidade_id', modalidadeData.modalidade_id)
        .eq('evento_id', modalidadeData.evento_id)
        .eq('status', 'confirmado');

      const totalAthletes = athletesData?.length || 0;

      return data.map(session => {
        const presences = session.chamada_presencas || [];
        const presentCount = presences.filter(p => p.status === 'presente').length;
        const lateCount = presences.filter(p => p.status === 'atrasado').length;
        const absentCount = Math.max(0, totalAthletes - presentCount - lateCount);
        
        return {
          session_date: format(new Date(session.data_hora_inicio), 'dd/MM', { locale: ptBR }),
          session_description: session.descricao,
          total_athletes: totalAthletes,
          present_count: presentCount,
          late_count: lateCount,
          absent_count: absentCount,
          attendance_rate: totalAthletes > 0 ? Math.round((presentCount / totalAthletes) * 100) : 0
        } as AttendanceReport;
      });
    },
    enabled: !!selectedModalidade,
  });

  // Buscar estatísticas por atleta
  const { data: athleteStats, isLoading: statsLoading } = useQuery({
    queryKey: ['athlete-stats', selectedModalidade],
    queryFn: async () => {
      if (!selectedModalidade || !sessions || sessions.length === 0) return [];

      // Buscar dados dos atletas e suas presenças
      const { data: modalidadeData } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id, evento_id')
        .eq('id', selectedModalidade)
        .single();

      if (!modalidadeData) return [];

      const { data: athletesData } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!atleta_id (
            nome_completo,
            numero_identificador
          )
        `)
        .eq('modalidade_id', modalidadeData.modalidade_id)
        .eq('evento_id', modalidadeData.evento_id)
        .eq('status', 'confirmado');

      if (!athletesData) return [];

      const sessionIds = sessions.map(s => s.id);
      const { data: attendancesData } = await supabase
        .from('chamada_presencas')
        .select('chamada_id, atleta_id, status')
        .in('chamada_id', sessionIds);

      const attendancesByAthlete = new Map();
      athletesData.forEach(athlete => {
        attendancesByAthlete.set(athlete.atleta_id, {
          athlete_name: athlete.usuarios.nome_completo,
          athlete_identifier: athlete.usuarios.numero_identificador || 'N/A',
          total_sessions: sessions.length,
          present_sessions: 0,
          late_sessions: 0,
          absent_sessions: 0
        });
      });

      attendancesData?.forEach(attendance => {
        const stats = attendancesByAthlete.get(attendance.atleta_id);
        if (stats) {
          switch (attendance.status) {
            case 'presente': stats.present_sessions++; break;
            case 'atrasado': stats.late_sessions++; break;
            default: stats.absent_sessions++; break;
          }
        }
      });

      // Calcular ausências para sessões não registradas
      attendancesByAthlete.forEach((stats, athleteId) => {
        const recordedSessions = stats.present_sessions + stats.late_sessions + stats.absent_sessions;
        stats.absent_sessions += Math.max(0, sessions.length - recordedSessions);
        stats.attendance_rate = stats.total_sessions > 0 
          ? Math.round((stats.present_sessions / stats.total_sessions) * 100) 
          : 0;
      });

      return Array.from(attendancesByAthlete.entries()).map(([athleteId, stats]) => ({
        athlete_id: athleteId,
        ...stats
      })) as AthleteAttendanceStats[];
    },
    enabled: !!selectedModalidade && !!sessions,
  });

  const handleExportCSV = () => {
    if (!athleteStats) return;

    const csvContent = [
      ['Nome', 'ID', 'Total Sessões', 'Presenças', 'Atrasos', 'Faltas', 'Taxa de Presença (%)'].join(','),
      ...athleteStats.map(stat => [
        stat.athlete_name,
        stat.athlete_identifier,
        stat.total_sessions,
        stat.present_sessions,
        stat.late_sessions,
        stat.absent_sessions,
        stat.attendance_rate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_presencas_${selectedModalidade}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <BarChart3 className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-3xl font-bold text-olimpics-text">Relatórios de Presença</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Você não está cadastrado como monitor de nenhuma modalidade.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-3xl font-bold text-olimpics-text">Relatórios de Presença</h1>
        </div>
        
        {selectedModalidade && athleteStats && (
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
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

      {selectedModalidade && (
        <>
          {/* Gráfico de Evolução das Presenças */}
          {sessionReports && sessionReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução da Taxa de Presença
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sessionReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session_date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Taxa de Presença']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendance_rate" 
                      stroke="#009B40" 
                      strokeWidth={2}
                      dot={{ fill: '#009B40', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Atletas por Presença */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-olimpics-green-primary" />
            </div>
          ) : athleteStats && athleteStats.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estatísticas por Atleta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atleta</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Presenças</TableHead>
                      <TableHead>Atrasos</TableHead>
                      <TableHead>Faltas</TableHead>
                      <TableHead>Taxa de Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {athleteStats
                      .sort((a, b) => b.attendance_rate - a.attendance_rate)
                      .map((stat) => (
                        <TableRow key={stat.athlete_id}>
                          <TableCell className="font-medium">
                            {stat.athlete_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {stat.athlete_identifier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              {stat.present_sessions}/{stat.total_sessions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {stat.late_sessions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {stat.absent_sessions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                              >
                                <div 
                                  className="h-full bg-olimpics-green-primary transition-all"
                                  style={{ width: `${stat.attendance_rate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {stat.attendance_rate}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  Nenhum dado de presença disponível ainda.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Registre algumas chamadas de presença para ver os relatórios.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
