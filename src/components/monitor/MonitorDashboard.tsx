
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Calendar, ClipboardList, FileText, TrendingUp, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MonitorModalitiesPage from './MonitorModalitiesPage';
import MonitorAttendancePage from './MonitorAttendancePage';
import MonitorReportsPage from './MonitorReportsPage';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';

export default function MonitorDashboard() {
  const [activeTab, setActiveTab] = useState("chamadas");
  const { data: modalities, isLoading } = useMonitorModalities();

  console.log('MonitorDashboard rendering with activeTab:', activeTab);

  const stats = {
    totalModalities: modalities?.length || 0,
    activeModalities: modalities?.filter(m => m.criado_em && new Date(m.criado_em) <= new Date()).length || 0,
    pendingSessions: 0 // This could be calculated from sessions data
  };

  return (
    <div className="min-h-screen pb-20 md:pb-6 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="space-y-6 px-2 sm:px-6 max-w-full">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-olimpics-green-primary/10 to-olimpics-orange-primary/10 rounded-xl blur-xl opacity-60" />
          <Card className="relative border-0 shadow-lg bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-olimpics-green-primary/20 rounded-full blur-md" />
                    <div className="relative bg-olimpics-green-primary/10 p-3 rounded-full border border-olimpics-green-primary/20">
                      <UserCheck className="h-6 w-6 text-olimpics-green-primary" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Filósofo Monitor
                    </h1>
                    <p className="text-muted-foreground text-sm">Gerencie modalidades e presenças</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-3">
                  <div className="text-center px-3 py-2 bg-muted/50 rounded-lg border">
                    <div className="text-lg font-semibold text-olimpics-green-primary">{stats.totalModalities}</div>
                    <div className="text-xs text-muted-foreground">Modalidades</div>
                  </div>
                  <div className="text-center px-3 py-2 bg-muted/50 rounded-lg border">
                    <div className="text-lg font-semibold text-olimpics-orange-primary">{stats.activeModalities}</div>
                    <div className="text-xs text-muted-foreground">Ativas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: "chamadas",
              title: "Chamadas",
              subtitle: "Gerenciar presenças",
              icon: ClipboardList,
              color: "olimpics-green-primary",
              badge: stats.pendingSessions > 0 ? stats.pendingSessions : null
            },
            {
              id: "modalidades", 
              title: "Modalidades",
              subtitle: "Minhas atribuições",
              icon: Calendar,
              color: "olimpics-orange-primary",
              badge: stats.totalModalities > 0 ? stats.totalModalities : null
            },
            {
              id: "relatorios",
              title: "Relatórios",
              subtitle: "Análises e dados",
              icon: TrendingUp,
              color: "primary",
              badge: null
            }
          ].map((tab) => (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'ring-2 ring-olimpics-green-primary shadow-lg border-olimpics-green-primary/20 bg-olimpics-green-primary/5' 
                  : 'hover:shadow-md border-border/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-olimpics-green-primary/10 text-olimpics-green-primary' 
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <tab.icon className="h-5 w-5" />
                  </div>
                  {tab.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <h3 className={`font-semibold transition-colors ${
                  activeTab === tab.id ? 'text-olimpics-green-primary' : 'text-foreground'
                }`}>
                  {tab.title}
                </h3>
                <p className="text-sm text-muted-foreground">{tab.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Hidden traditional tabs for accessibility */}
          <TabsList className="sr-only">
            <TabsTrigger value="chamadas">Chamadas</TabsTrigger>
            <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="chamadas" className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <MonitorAttendancePage />
            </div>
          </TabsContent>

          <TabsContent value="modalidades" className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <MonitorModalitiesPage />
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <MonitorReportsPage />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
