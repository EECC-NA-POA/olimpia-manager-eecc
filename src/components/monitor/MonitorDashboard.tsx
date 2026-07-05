
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, CalendarDays, Bell, TrendingUp, LayoutGrid } from "lucide-react";
import MonitorModalitiesPage from './MonitorModalitiesPage';
import MonitorAttendancePage from './MonitorAttendancePage';
import MonitorReportsPage from './MonitorReportsPage';
import MonitorNotificationsPage from './MonitorNotificationsPage';
import { MonitorSchedulePage } from './MonitorSchedulePage';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';
import { useAllMonitorSessions } from '@/hooks/useAllMonitorSessions';

// Papéis com acesso: Filósofo Monitor (dono das próprias modalidades) e
// ADM/ORG/ORE/MST (visão geral, tratada dentro de MonitorAttendancePage).
const ALLOWED_CODES = ['FMON', 'FMO', 'ADM', 'ORG', 'ORE', 'MST'];

const TABS = [
  { id: "chamadas",    label: "Chamadas",      Icon: ClipboardList },
  { id: "modalidades", label: "Modalidades",   Icon: LayoutGrid    },
  { id: "cronograma",  label: "Cronograma",    Icon: CalendarDays  },
  { id: "notificacoes",label: "Notificações",  Icon: Bell          },
  { id: "relatorios",  label: "Relatórios",    Icon: TrendingUp    },
];

export default function MonitorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chamadas");
  const { data: modalities } = useMonitorModalities();
  const { data: sessions } = useAllMonitorSessions();

  const rolesLoaded = Array.isArray(user?.papeis);
  const hasAccess = !!user?.is_master || (user?.papeis?.some(role => ALLOWED_CODES.includes(role.codigo)) ?? false);

  useEffect(() => {
    if (rolesLoaded && !hasAccess) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/');
    }
  }, [rolesLoaded, hasAccess, navigate]);

  const totalSessions   = sessions?.length ?? 0;
  const totalModalities = modalities?.length ?? 0;

  return (
    <div className="w-full py-2 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Filósofo Monitor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie modalidades e presenças</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center px-3 py-2 rounded-lg border bg-card">
            <p className="text-lg font-bold text-olimpics-green-primary">{totalModalities}</p>
            <p className="text-[11px] text-muted-foreground">Modalidades</p>
          </div>
          <div className="text-center px-3 py-2 rounded-lg border bg-card">
            <p className="text-lg font-bold text-foreground">{totalSessions}</p>
            <p className="text-[11px] text-muted-foreground">Chamadas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full bg-background p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1 border-b mb-4 rounded-none">
            {TABS.map(({ id, label, Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary data-[state=active]:text-olimpics-green-primary rounded-none whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="chamadas">
          <MonitorAttendancePage />
        </TabsContent>
        <TabsContent value="modalidades">
          <MonitorModalitiesPage />
        </TabsContent>
        <TabsContent value="cronograma">
          <MonitorSchedulePage />
        </TabsContent>
        <TabsContent value="notificacoes">
          <MonitorNotificationsPage />
        </TabsContent>
        <TabsContent value="relatorios">
          <MonitorReportsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
