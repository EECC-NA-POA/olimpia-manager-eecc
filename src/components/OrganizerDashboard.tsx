
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ListChecks, BarChart } from "lucide-react";
import { EmptyState } from "./dashboard/components/EmptyState";
import { LoadingState } from "./dashboard/components/LoadingState";
import { ErrorState } from "./dashboard/components/ErrorState";
import { DashboardHeader } from "./dashboard/components/DashboardHeader";
import { NoEventSelected } from "./dashboard/components/NoEventSelected";
import { AthletesTab } from "./dashboard/tabs/AthletesTab";
import { EnrollmentsTab } from "./dashboard/tabs/EnrollmentsTab";
import { StatisticsTab } from "./dashboard/tabs/StatisticsTab";
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

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <Tabs defaultValue="statistics" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="w-full border-b mb-8 bg-background flex justify-start space-x-2 p-0">
          <TabsTrigger 
            value="statistics"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <BarChart className="h-5 w-5" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger 
            value="athletes"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <Users className="h-5 w-5" />
            Gerenciar Atletas
          </TabsTrigger>
          <TabsTrigger 
            value="enrollments"
            className="flex items-center gap-2 px-6 py-3 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-olimpics-green-primary rounded-none"
          >
            <ListChecks className="h-5 w-5" />
            Inscrições por Modalidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="mt-6">
          {renderTabContent("statistics")}
        </TabsContent>

        <TabsContent value="athletes" className="mt-6">
          {renderTabContent("athletes")}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          {renderTabContent("enrollments")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
