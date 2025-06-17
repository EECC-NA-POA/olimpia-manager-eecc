
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ListChecks, BarChart, Bell } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";
import { AthletesTab } from "./dashboard/tabs/AthletesTab";
import { EnrollmentsTab } from "./dashboard/tabs/EnrollmentsTab";
import { StatisticsTab } from "./dashboard/tabs/StatisticsTab";
import { NotificationManager } from "./notifications/NotificationManager";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DelegationDashboard() {
  const { user, currentEventId } = useAuth();
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("statistics");

  // Check if the user is a delegation representative
  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD') || false;

  const {
    isRefreshing,
    branches,
    athletes,
    confirmedEnrollments,
    branchAnalytics,
    isLoading,
    error,
    handleRefresh
  } = useDashboardData(currentEventId, isDelegationRep);

  if (!currentEventId) {
    return <NoEventSelected />;
  }

  // Only show global loading state before the initial data fetch
  if (isLoading.any && (!athletes && !branchAnalytics && !confirmedEnrollments)) {
    return <LoadingState />;
  }

  // Only show global error if everything failed
  if (error.any && (!athletes && !branchAnalytics && !confirmedEnrollments)) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Erro ao carregar dados');
    return <ErrorState onRetry={handleRefresh} />;
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
        return (
          <StatisticsTab 
            data={branchAnalytics} 
            currentBranchId={user?.filial_id}
          />
        );
      
      case "athletes":
        if (isLoading.athletes || isLoading.branches) {
          return <LoadingState />;
        }
        if (error.athletes || error.branches) {
          return <ErrorState onRetry={handleRefresh} />;
        }
        if (!athletes || athletes.length === 0) {
          return <EmptyState title="Nenhum atleta encontrado" description="Não há atletas cadastrados para este evento" />;
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
          return <EmptyState title="Nenhuma inscrição confirmada" description="Não há inscrições confirmadas para este evento" />;
        }
        return <EnrollmentsTab enrollments={confirmedEnrollments} />;

      case "notifications":
        return (
          <NotificationManager
            eventId={currentEventId}
            userId={user?.id || ''}
            userBranchId={user?.filial_id}
            isRepresentanteDelegacao={isDelegationRep}
            isOrganizer={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <Tabs defaultValue="statistics" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full min-w-max border-b mb-6 sm:mb-8 bg-background grid grid-cols-2 sm:flex sm:justify-start sm:space-x-2 p-0 h-auto gap-1 sm:gap-0">
            <TabsTrigger 
              value="statistics"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
            >
              <BarChart className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="athletes"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
            >
              <Users className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Gerenciar Atletas</span>
              <span className="sm:hidden">Atletas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="enrollments"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
            >
              <ListChecks className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Inscrições por Modalidade</span>
              <span className="sm:hidden">Inscrições</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none whitespace-nowrap"
            >
              <Bell className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="statistics" className="mt-4 sm:mt-6">
          {renderTabContent("statistics")}
        </TabsContent>

        <TabsContent value="athletes" className="mt-4 sm:mt-6">
          {renderTabContent("athletes")}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4 sm:mt-6">
          {renderTabContent("enrollments")}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 sm:mt-6">
          {renderTabContent("notifications")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
