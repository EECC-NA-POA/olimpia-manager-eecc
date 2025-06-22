
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Calendar, ClipboardList, FileText } from "lucide-react";
import MonitorModalitiesPage from './MonitorModalitiesPage';
import MonitorAttendancePage from './MonitorAttendancePage';
import MonitorReportsPage from './MonitorReportsPage';

export default function MonitorDashboard() {
  const [activeTab, setActiveTab] = useState("chamadas");

  console.log('MonitorDashboard rendering with activeTab:', activeTab);

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full">
        <div className="flex items-center gap-2 sm:gap-3 px-2">
          <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-olimpics-green-primary flex-shrink-0" />
          <h1 className="text-xl sm:text-3xl font-bold text-olimpics-text truncate">Filósofo Monitor</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsList className="w-full min-w-max bg-background grid grid-cols-3 p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1 border-b mb-3 sm:mb-6">
              <TabsTrigger 
                value="chamadas"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
              >
                <ClipboardList className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="hidden xs:inline">Chamadas</span>
                <span className="xs:hidden text-[10px]">Ch</span>
              </TabsTrigger>
              <TabsTrigger 
                value="modalidades"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
              >
                <Calendar className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">Modalidades</span>
                <span className="hidden sm:inline">Minhas Modalidades</span>
                <span className="xs:hidden text-[10px]">Mo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap min-w-0"
              >
                <FileText className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">Relatórios</span>
                <span className="hidden sm:inline">Relatórios de Presença</span>
                <span className="xs:hidden text-[10px]">Re</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chamadas" className="mt-2 sm:mt-6">
            <MonitorAttendancePage />
          </TabsContent>

          <TabsContent value="modalidades" className="mt-2 sm:mt-6">
            <MonitorModalitiesPage />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-2 sm:mt-6">
            <MonitorReportsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
