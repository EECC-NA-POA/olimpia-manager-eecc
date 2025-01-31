import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations, updateModalityStatus, updatePaymentStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { AthleteRegistrationCard } from "./AthleteRegistrationCard";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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

export default function DelegationDashboard() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  // First, fetch the user's filial_id
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics', userProfile?.filial_id],
    queryFn: async () => {
      console.log('Fetching branch analytics for filial:', userProfile?.filial_id);
      const { data, error } = await supabase
        .from('vw_analytics_inscricoes')
        .select('*')
        .eq('filial_id', userProfile?.filial_id)
        .single();
      
      if (error) throw error;
      return data ? [data] : [];
    },
    enabled: !!userProfile?.filial_id,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations
  } = useQuery({
    queryKey: ['athlete-registrations', userProfile?.filial_id],
    queryFn: async () => {
      console.log('Fetching registrations for filial:', userProfile?.filial_id);
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('filial_id', userProfile?.filial_id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.filial_id,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('Refreshing delegation dashboard data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] }),
        refetchAnalytics(),
        refetchRegistrations()
      ]);
      console.log('Dashboard data refreshed successfully');
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (modalityId: string, status: string, justification: string) => {
    console.log('Attempting to update modality status:', { modalityId, status, justification });
    try {
      await updateModalityStatus(modalityId, status, justification);
      console.log('Status updated successfully in the database');
      toast.success("Status atualizado com sucesso!");
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      console.log('Queries invalidated and refetched');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erro ao atualizar status. Por favor, tente novamente.");
      throw error;
    }
  };

  const handlePaymentStatusChange = async (athleteId: string, status: string) => {
    console.log('Attempting to update payment status:', { athleteId, status });
    try {
      await updatePaymentStatus(athleteId, status);
      console.log('Payment status updated successfully in the database');
      toast.success("Status de pagamento atualizado com sucesso!");
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branch-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['athlete-registrations'] })
      ]);
      console.log('Queries invalidated and refetched after payment status update');
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar status de pagamento";
      toast.error(errorMessage);
      throw error;
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
          <Button variant="outline" onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!branchAnalytics || branchAnalytics.length === 0) {
    return <EmptyState />;
  }

  console.log('Branch analytics data:', branchAnalytics);
  console.log('Registrations data:', registrations);
  console.log('Current user ID:', user?.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">Dashboard da Delegação</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Dados
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <DashboardMetrics data={branchAnalytics} />
        <DashboardCharts data={branchAnalytics} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Gerenciamento de Atletas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations?.map((registration) => (
            <AthleteRegistrationCard
              key={registration.id}
              registration={registration}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
              isCurrentUser={user?.id === registration.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}