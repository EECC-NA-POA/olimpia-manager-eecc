
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ListChecks, BarChart, Bell, UserCheck } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";
import { AthletesTab } from "./dashboard/tabs/AthletesTab";
import { EnrollmentsTab } from "./dashboard/tabs/EnrollmentsTab";
import { StatisticsTab } from "./dashboard/tabs/StatisticsTab";
import { OrganizerRepresentativesTab } from "./dashboard/tabs/OrganizerRepresentativesTab";
import { TeamsTab } from "./dashboard/tabs/TeamsTab";
import { NotificationManager } from "./notifications/NotificationManager";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function OrganizerDashboard() {
  const { user, currentEventId } = useAuth();
  const [activeTab, setActiveTab] = useState("statistics");
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const {
    isRefreshing,
    branches,
    athletes,
    confirmedEnrollments,
    branchAnalytics,
    isLoading,
    error,
    handleRefresh
  } = useDashboardData(currentEventId);

  if (!currentEventId) {
    return <NoEventSelected />;
  }

  const renderTabContent = (tabName: string) => {
    switch (tabName) {
      case "statistics":
        if (isLoading.analytics) {
          return <LoadingState />;
        }
        if (error.analytics) {
          return <ErrorState onRetry={handleRefresh} />;
        }
        if (!branchAnalytics || branchAnalytics.length === 0) {
          return <EmptyState 
                    title="Não há dados estatísticos disponíveis" 
                    description="Não encontramos dados de análise para exibir neste momento" 
                 />;
        }
        return <StatisticsTab data={branchAnalytics} />;
      
      case "athletes":
        if (isLoading.athletes || isLoading.branches) {
          return <LoadingState />;
        }
        if (error.athletes || error.branches) {
          return <ErrorState onRetry={handleRefresh} />;
        }
        if (!athletes || athletes.length === 0) {
          return <EmptyState 
                    title="Nenhum atleta encontrado"
                    description="Não há atletas cadastrados para este evento" 
                 />;
        }
        return (
          <AthletesTab
            athletes={athletes}
            branches={branches || []}
            currentUserId={user?.id}
            currentEventId={currentEventId}
            filters={{
              nameFilter,
              branchFilter,
              paymentStatusFilter
            }}
            onFilterChange={{
              setNameFilter,
              setBranchFilter,
              setPaymentStatusFilter
            }}
          />
        );
      
      case "enrollments":
        if (isLoading.enrollments) {
          return <LoadingState />;
        }
        if (error.enrollments) {
          return <ErrorState onRetry={handleRefresh} />;
        }
        if (!confirmedEnrollments || confirmedEnrollments.length === 0) {
          return <EmptyState 
                    title="Nenhuma inscrição confirmada"
                    description="Não há inscrições confirmadas para este evento" 
                 />;
        }
        return <EnrollmentsTab enrollments={confirmedEnrollments} />;

      case "representatives":
        return <OrganizerRepresentativesTab eventId={currentEventId} />;

      case "teams":
        return (
          <TeamsTab 
            eventId={currentEventId} 
            branchId={null}
          />
        );

      case "notifications":
        return (
          <NotificationManager
            eventId={currentEventId}
            userId={user?.id || ''}
            isOrganizer={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-2 sm:py-6 space-y-2 sm:space-y-6 px-2 sm:px-4 max-w-full overflow-x-hidden">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <Tabs defaultValue="statistics" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="w-full overflow-hidden">
          <TabsList className="w-full bg-background flex flex-wrap justify-start p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1 border-b mb-3 sm:mb-8">
            <TabsTrigger 
              value="statistics"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <BarChart className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Stats</span>
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="xs:hidden text-[10px]">St</span>
            </TabsTrigger>
            <TabsTrigger 
              value="athletes"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <Users className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Atletas</span>
              <span className="hidden sm:inline">Gerenciar Atletas</span>
              <span className="xs:hidden text-[10px]">At</span>
            </TabsTrigger>
            <TabsTrigger 
              value="enrollments"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <ListChecks className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Inscrições</span>
              <span className="hidden sm:inline">Inscrições por Modalidade</span>
              <span className="xs:hidden text-[10px]">In</span>
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <Users className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Equipes</span>
              <span className="hidden sm:inline">Equipes</span>
              <span className="xs:hidden text-[10px]">Eq</span>
            </TabsTrigger>
            <TabsTrigger 
              value="representatives"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <UserCheck className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Repr</span>
              <span className="hidden sm:inline">Representantes</span>
              <span className="xs:hidden text-[10px]">Re</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-normal break-words text-center flex-1 basis-1/2 sm:basis-1/3 md:basis-auto min-w-0"
            >
              <Bell className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Notif</span>
              <span className="hidden sm:inline">Notificações</span>
              <span className="xs:hidden text-[10px]">No</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="statistics" className="mt-2 sm:mt-6">
          {renderTabContent("statistics")}
        </TabsContent>

        <TabsContent value="athletes" className="mt-2 sm:mt-6">
          {renderTabContent("athletes")}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-2 sm:mt-6">
          {renderTabContent("enrollments")}
        </TabsContent>

        <TabsContent value="teams" className="mt-2 sm:mt-6">
          {renderTabContent("teams")}
        </TabsContent>

        <TabsContent value="representatives" className="mt-2 sm:mt-6">
          {renderTabContent("representatives")}
        </TabsContent>

        <TabsContent value="notifications" className="mt-2 sm:mt-6">
          {renderTabContent("notifications")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
