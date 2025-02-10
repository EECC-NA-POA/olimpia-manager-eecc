
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBranchAnalytics, fetchAthleteRegistrations } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select('perfis (nome)')
        .eq('usuario_id', user.id);
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      // Find if user has Organizador role
      const isOrganizer = data?.some(role => role.perfis?.nome === 'Organizador');
      return isOrganizer ? 'Organizador' : null;
    },
    enabled: !!user?.id
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { 
    data: branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['branch-analytics'],
    queryFn: fetchBranchAnalytics,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations
  } = useQuery({
    queryKey: ['athlete-registrations'],
    queryFn: fetchAthleteRegistrations,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const { data: confirmedEnrollments } = useQuery({
    queryKey: ['confirmed-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_inscricoes_atletas')
        .select('*')
        .eq('status_inscricao', 'confirmado')
        .order('modalidade_nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleRefresh = async () => {
    console.log('Refreshing dashboard data...');
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
    }
  };

  return {
    branches,
    branchAnalytics,
    registrations,
    confirmedEnrollments,
    isLoadingAnalytics,
    isLoadingRegistrations,
    analyticsError,
    registrationsError,
    handleRefresh,
    userRole
  };
};
