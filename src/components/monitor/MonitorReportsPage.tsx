
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
  const [selectedModalidade, setSelectedModalidade] = useState<string | null>(null);

  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
  const { data: sessions } = useMonitorSessions(selectedModalidade || undefined);

  console.log('MonitorReportsPage - Modalities data:', modalities);
  console.log('MonitorReportsPage - Selected modalidade:', selectedModalidade);
  console.log('MonitorReportsPage - Sessions data:', sessions);

  // Buscar relatório de presenças por sessão
  const { data: sessionReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['attendance-reports', selectedModalidade],
    queryFn: async () => {
      if (!selectedModalidade) {
        console.log('No modalidade selected for reports');
        return [];
      }

      console.log('Fetching attendance reports for modalidade_rep_id:', selectedModalidade);

      // Primeiro, buscar as chamadas para esta modalidade
      const { data: chamadasData, error: chamadasError } = await supabase
        .from('chamadas')
        .select(`
          id,
          data_hora_inicio,
          descricao,
          modalidade_rep_id
        `)
        .eq('modalidade_rep_id', selectedModalidade)
        .order('data_hora_inicio', { ascending: true });

      if (chamadasError) {
        console.error('Error fetching chamadas:', chamadasError);
        throw chamadasError;
      }

      console.log('Chamadas data for reports:', chamadasData);

      if (!chamadasData || chamadasData.length === 0) {
        console.log('No chamadas found for this modalidade');
        return [];
      }

      // Buscar presenças para cada chamada
      const chamadasIds = chamadasData.map(c => c.id);
      const { data: presencasData, error: presencasError } = await supabase
        .from('chamada_presencas')
        .select('chamada_id, status, atleta_id')
        .in('chamada_id', chamadasIds);

      if (presencasError) {
        console.error('Error fetching presencas:', presencasError);
        throw presencasError;
      }

      console.log('Presencas data for reports:', presencasData);

      // Buscar informações da modalidade para obter total de atletas
      const selectedModality = modalities?.find(m => m.id === selectedModalidade);
      if (!selectedModality) {
        console.log('Selected modality not found in modalities list');
        return [];
      }

      console.log('Selected modality for total athletes:', selectedModality);

      // Buscar total de atletas inscritos nesta modalidade específica
      const { data: athletesData, error: athletesError } = await supabase
        .from('inscricoes_modalidades')
        .select('atleta_id')
        .eq('modalidade_id', selectedModality.modalidade_id)
        .eq('evento_id', selectedModality.modalidades.evento_id)
        .eq('status', 'confirmado');

      if (athletesError) {
        console.error('Error fetching athletes:', athletesError);
      }

      const totalAthletes = athletesData?.length || 0;
      console.log('Total athletes for this modality:', totalAthletes);

      // Agrupar presenças por chamada
      const presencasPorChamada = new Map();
      presencasData?.forEach(presenca => {
        if (!presencasPorChamada.has(presenca.chamada_id)) {
          presencasPorChamada.set(presenca.chamada_id, []);
        }
        presencasPorChamada.get(presenca.chamada_id).push(presenca);
      });

      const reports = chamadasData.map(chamada => {
        const presences = presencasPorChamada.get(chamada.id) || [];
        const presentCount = presences.filter(p => p.status === 'presente').length;
        const lateCount = presences.filter(p => p.status === 'atrasado').length;
        const absentCount = Math.max(0, totalAthletes - presentCount - lateCount);
        
        return {
          session_date: format(new Date(chamada.data_hora_inicio), 'dd/MM', { locale: ptBR }),
          session_description: chamada.descricao,
          total_athletes: totalAthletes,
          present_count: presentCount,
          late_count: lateCount,
          absent_count: absentCount,
          attendance_rate: totalAthletes > 0 ? Math.round((presentCount / totalAthletes) * 100) : 0
        } as AttendanceReport;
      });

      console.log('Processed attendance reports:', reports);
      return reports;
    },
    enabled: !!selectedModalidade && !!modalities,
  });

  // Buscar estatísticas por atleta
  const { data: athleteStats, isLoading: statsLoading } = useQuery({
    queryKey: ['athlete-stats', selectedModalidade],
    queryFn: async () => {
      if (!selectedModalidade || !sessions || sessions.length === 0 || !modalities) {
        console.log('Missing data for athlete stats:', { selectedModalidade, sessions: sessions?.length, modalities: modalities?.length });
        return [];
      }

      console.log('Fetching athlete stats for modalidade:', selectedModalidade);

      const selectedModality = modalities.find(m => m.id === selectedModalidade);
      if (!selectedModality) {
        console.log('Selected modality not found');
        return [];
      }

      // Buscar atletas inscritos nesta modalidade
      const { data: athletesData, error: athletesError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            nome_completo
          ),
          pagamentos (
            numero_identificador
          )
        `)
        .eq('modalidade_id', selectedModality.modalidade_id)
        .eq('evento_id', selectedModality.modalidades.evento_id)
        .eq('status', 'confirmado');

      if (athletesError) {
        console.error('Error fetching athletes data:', athletesError);
        return [];
      }

      console.log('Athletes data for stats:', athletesData);

      if (!athletesData || athletesData.length === 0) {
        console.log('No athletes found for this modality');
        return [];
      }

      // Buscar presenças de todos os atletas
      const sessionIds = sessions.map(s => s.id);
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('chamada_presencas')
        .select('chamada_id, atleta_id, status')
        .in('chamada_id', sessionIds);

      if (attendancesError) {
        console.error('Error fetching attendances:', attendancesError);
      }

      console.log('Attendances data for stats:', attendancesData);

      const attendancesByAthlete = new Map();
      athletesData.forEach(athlete => {
        const userData = Array.isArray(athlete.usuarios) ? athlete.usuarios[0] : athlete.usuarios;
        const paymentData = athlete.pagamentos && athlete.pagamentos.length > 0 ? athlete.pagamentos[0] : null;
        
        if (userData) {
          attendancesByAthlete.set(athlete.atleta_id, {
            athlete_name: userData.nome_completo,
            athlete_identifier: paymentData?.numero_identificador || 'N/A',
            total_sessions: sessions.length,
            present_sessions: 0,
            late_sessions: 0,
            absent_sessions: 0
          });
        }
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

      const result = Array.from(attendancesByAthlete.entries()).map(([athleteId, stats]) => ({
        athlete_id: athleteId,
        ...stats
      })) as AthleteAttendanceStats[];

      console.log('Athlete stats result:', result);
      return result;
    },
    enabled: !!selectedModalidade && !!sessions && !!modalities,
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
            value={selectedModalidade || ''}
            onValueChange={(value) => setSelectedModalidade(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma modalidade" />
            </SelectTrigger>
            <SelectContent>
              {modalities.map((modality) => (
                <SelectItem key={modality.id} value={modality.id}>
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

          {/* Relatório de Sessões */}
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-olimpics-green-primary" />
            </div>
          ) : sessionReports && sessionReports.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório por Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Total Atletas</TableHead>
                      <TableHead>Presenças</TableHead>
                      <TableHead>Atrasos</TableHead>
                      <TableHead>Faltas</TableHead>
                      <TableHead>Taxa de Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionReports.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell>{report.session_date}</TableCell>
                        <TableCell>{report.session_description}</TableCell>
                        <TableCell>{report.total_athletes}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {report.present_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {report.late_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">
                            {report.absent_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-olimpics-green-primary transition-all"
                                style={{ width: `${report.attendance_rate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {report.attendance_rate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

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
