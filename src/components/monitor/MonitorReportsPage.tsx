
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Calendar, Users, Clock, BarChart3, PieChart, Activity } from "lucide-react";

export default function MonitorReportsPage() {
  // Mock data for demonstration
  const reportStats = {
    totalSessions: 12,
    totalAttendees: 156,
    averageAttendance: 85,
    lastSession: "2024-01-15"
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
                <div className="text-2xl font-bold text-olimpics-green-primary">{reportStats.totalSessions}</div>
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
                <div className="text-2xl font-bold text-olimpics-orange-primary">{reportStats.totalAttendees}</div>
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
                <div className="text-2xl font-bold text-blue-600">{reportStats.averageAttendance}%</div>
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
                <div className="text-lg font-bold text-purple-600">15/01</div>
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
              {[
                { name: "Futebol", attendance: 92, total: 24 },
                { name: "Basquete", attendance: 78, total: 18 },
                { name: "Vôlei", attendance: 85, total: 20 },
                { name: "Natação", attendance: 95, total: 16 }
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.attendance}% ({item.total} atletas)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-olimpics-green-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${item.attendance}%` }}
                    />
                  </div>
                </div>
              ))}
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
              {[
                { action: "Chamada realizada", modality: "Futebol", time: "2h atrás", present: 22, total: 24 },
                { action: "Sessão finalizada", modality: "Basquete", time: "1 dia atrás", present: 16, total: 18 },
                { action: "Chamada realizada", modality: "Vôlei", time: "2 dias atrás", present: 19, total: 20 },
                { action: "Sessão iniciada", modality: "Natação", time: "3 dias atrás", present: 15, total: 16 }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-1.5 bg-olimpics-green-primary/10 rounded-full">
                    <Clock className="h-3 w-3 text-olimpics-green-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.modality} • {activity.time}</div>
                    {activity.present && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {activity.present}/{activity.total} presentes
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
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
