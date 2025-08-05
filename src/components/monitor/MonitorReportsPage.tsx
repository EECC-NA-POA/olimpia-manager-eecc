
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Calendar, Users, Clock, BarChart3, PieChart, Activity, Loader2 } from "lucide-react";
import { useMonitorReports } from '@/hooks/useMonitorReports';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MonitorReportsPage() {
  const { data: reportData, isLoading, error } = useMonitorReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando relatórios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar relatórios</p>
          <p className="text-sm text-muted-foreground mt-1">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
          <p className="text-sm text-muted-foreground mt-1">Realize algumas chamadas para ver os relatórios</p>
        </div>
      </div>
    );
  }

  const formatLastSession = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), 'dd/MM', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há poucos minutos';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 dia atrás';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    
    return format(sessionDate, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
              <p className="text-sm text-muted-foreground font-normal">
                Acompanhe métricas e desempenho das suas modalidades
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-olimpics-green-primary/5 to-olimpics-green-primary/10 border-olimpics-green-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-olimpics-green-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-olimpics-green-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-olimpics-green-primary">{reportData.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessões Realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-olimpics-orange-primary/5 to-olimpics-orange-primary/10 border-olimpics-orange-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-olimpics-orange-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-olimpics-orange-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-olimpics-orange-primary">{reportData.totalPresences}</div>
                <div className="text-sm text-muted-foreground">Total de Presenças</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{reportData.averageAttendance}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Presença</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{formatLastSession(reportData.lastSession)}</div>
                <div className="text-sm text-muted-foreground">Última Sessão</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-olimpics-green-primary" />
              Presença por Modalidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.modalityStats.length > 0 ? (
                reportData.modalityStats.map((modality) => (
                  <div key={modality.modalidade_nome} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{modality.modalidade_nome}</span>
                      <span className="text-muted-foreground">
                        {modality.attendance_rate}% ({modality.total_presences}/{modality.total_attendees})
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-olimpics-green-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${modality.attendance_rate}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma modalidade com dados ainda</p>
                  <p className="text-xs">Realize chamadas para ver as estatísticas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-olimpics-orange-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recentActivities.length > 0 ? (
                reportData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-1.5 bg-olimpics-green-primary/10 rounded-full">
                      <Clock className="h-3 w-3 text-olimpics-green-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {activity.data_hora_fim ? 'Sessão finalizada' : 'Sessão realizada'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.modalidade_nome} • {getRelativeTime(activity.data_hora_inicio)}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {activity.total_presentes}/{activity.total_atletas} presentes
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                  <p className="text-xs">Suas próximas sessões aparecerão aqui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <PieChart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mais Relatórios em Breve</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Estamos desenvolvendo relatórios avançados com gráficos detalhados, exportação de dados e análises comparativas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
