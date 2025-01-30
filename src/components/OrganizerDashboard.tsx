import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations, updateModalityStatus, updatePaymentStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { DashboardTable } from "./dashboard/DashboardTable";
import { AthleteRegistrationCard } from "./AthleteRegistrationCard";
import { toast } from "sonner";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <p className="text-muted-foreground mb-2">Nenhum dado disponível no momento</p>
    <p className="text-sm text-muted-foreground mb-4">
      Verifique se existem inscrições registradas no sistema
    </p>
    <Button
      variant="outline"
      onClick={() => {
        window.location.reload();
      }}
    >
      Atualizar Dados
    </Button>
  </div>
);

export default function OrganizerDashboard() {
  const queryClient = useQueryClient();

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics'],
    queryFn: fetchBranchAnalytics,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError 
  } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: fetchAthleteRegistrations,
  });

  const handleStatusChange = async (modalityId: string, status: string, justification: string) => {
    try {
      await updateModalityStatus(modalityId, status, justification);
      toast.success("Status atualizado com sucesso!");
      
      // Invalidate and refetch both queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      
      console.log('Data refreshed after status update');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handlePaymentStatusChange = async (athleteId: string, status: string) => {
    try {
      await updatePaymentStatus(athleteId, status);
      toast.success("Status de pagamento atualizado com sucesso!");
      
      // Invalidate and refetch both queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      
      console.log('Data refreshed after payment status update');
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status de pagamento";
      toast.error(errorMessage);
    }
  };

  if (isLoadingAnalytics || isLoadingRegistrations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  if (analyticsError || registrationsError) {
    console.error('Error fetching data:', analyticsError || registrationsError);
    toast.error('Erro ao carregar dados do dashboard');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar dados</p>
          <Button variant="outline" onClick={() => refetchAnalytics()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!branchAnalytics || branchAnalytics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Organizador</h1>
        <Button onClick={() => refetchAnalytics()}>Atualizar Dados</Button>
      </div>
      
      <DashboardMetrics data={branchAnalytics} />
      <DashboardCharts data={branchAnalytics} />
      <DashboardTable data={branchAnalytics} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Gerenciamento de Atletas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations?.map((registration) => (
            <AthleteRegistrationCard
              key={registration.id}
              registration={registration}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}