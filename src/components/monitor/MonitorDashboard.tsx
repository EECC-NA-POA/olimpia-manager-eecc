
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck } from "lucide-react";
import MonitorModalitiesPage from './MonitorModalitiesPage';
import MonitorAttendancePage from './MonitorAttendancePage';
import MonitorReportsPage from './MonitorReportsPage';

export default function MonitorDashboard() {
  const [activeTab, setActiveTab] = useState("chamadas");

  console.log('MonitorDashboard rendering with activeTab:', activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="h-8 w-8 text-olimpics-green-primary" />
        <h1 className="text-3xl font-bold text-olimpics-text">Filósofo Monitor</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chamadas">Chamadas</TabsTrigger>
          <TabsTrigger value="modalidades">Minhas Modalidades</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios de Presença</TabsTrigger>
        </TabsList>

        <TabsContent value="chamadas" className="mt-6">
          <MonitorAttendancePage />
        </TabsContent>

        <TabsContent value="modalidades" className="mt-6">
          <MonitorModalitiesPage />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <MonitorReportsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
