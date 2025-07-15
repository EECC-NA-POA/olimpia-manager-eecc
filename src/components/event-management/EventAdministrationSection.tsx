
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAthleteManagement, fetchBranches } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { UserProfilesTable } from '@/components/dashboard/UserProfilesTable';
import { UserCreationDialog } from '@/components/admin/UserCreationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface EventAdministrationSectionProps {
  eventId: string | null;
}

export function EventAdministrationSection({ eventId }: EventAdministrationSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has admin profile
  const hasAdminProfile = user?.papeis?.some(role => role.codigo === 'ADM');
  
  console.log('EventAdministrationSection - EventId:', eventId);
  console.log('EventAdministrationSection - HasAdminProfile:', hasAdminProfile);

  // Use the SAME query that works in AthletesTab - fetchAthleteManagement
  const { 
    data: athletes,
    isLoading: isLoadingAthletes,
    refetch: refetchAthletes,
    error: athletesError
  } = useQuery({
    queryKey: ['athlete-management', eventId, false], // Same key as AthletesTab
    queryFn: () => {
      console.log('===== USING fetchAthleteManagement =====');
      console.log('EventId:', eventId);
      return fetchAthleteManagement(false, eventId); // Same function as AthletesTab
    },
    enabled: !!eventId && hasAdminProfile,
    staleTime: 0
  });

  // Simple direct query for user profiles
  const { 
    data: allUserProfiles,
    isLoading: isLoadingProfiles
  } = useQuery({
    queryKey: ['simple-user-profiles'],
    queryFn: async () => {
      console.log('===== SIMPLE PROFILES QUERY =====');
      
      // Get all user-profile relationships
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome_completo,
          papeis (
            id,
            nome,
            codigo
          )
        `);

      console.log('Simple query result:', data);
      console.log('Simple query error:', error);
      console.log('==================================');

      return data || [];
    },
    enabled: hasAdminProfile,
    staleTime: 0
  });
  console.log('===== COMPONENT STATE =====');
  console.log('Athletes:', athletes);
  console.log('All user profiles:', allUserProfiles);
  console.log('Athletes count:', athletes?.length);
  console.log('Profiles count:', allUserProfiles?.length);
  console.log('========================');

  const { 
    data: branches
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    enabled: hasAdminProfile
  });

  // Set up event listener for profile updates
  useEffect(() => {
  const handleProfileUpdate = () => {
      console.log('Profile update detected, refreshing data...');
      refetchAthletes();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [refetchAthletes, queryClient]);

  if (!eventId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-sm">
            Nenhum evento selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasAdminProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-sm">
            Acesso restrito a administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = athletes?.length || 0;

  // Convert AthleteManagement data to UserProfile format
  const formattedUserProfiles = athletes?.map((athlete: any) => {
    console.log(`===== ATHLETE ${athlete.nome_atleta} =====`);
    
    // Find this user in the profiles data
    const userProfile = allUserProfiles?.find((user: any) => user.id === athlete.id);
    console.log('Found user profile:', userProfile);
    
    // Get profiles - default to Atleta if none found
    const profiles = userProfile?.papeis || [];
    
    const formattedProfiles = profiles.length > 0 ? 
      profiles.map((profile: any) => ({
        id: profile.id,
        nome: profile.nome,
        codigo: profile.codigo
      })) :
      [{ id: 1, nome: 'Atleta', codigo: 'ATL' }];
    
    console.log('Final profiles:', formattedProfiles);
    console.log('==============================');

    return {
      id: athlete.id,
      nome_completo: athlete.nome_atleta,
      email: athlete.email,
      numero_documento: athlete.numero_documento,
      tipo_documento: athlete.tipo_documento,
      filial_id: athlete.filial_id,
      created_at: new Date().toISOString(),
      papeis: formattedProfiles,
      pagamentos: athlete.modalidades?.map((mod: any) => ({
        status: athlete.status_pagamento,
        valor: 0,
        created_at: new Date().toISOString()
      })) || [],
      status_pagamento: athlete.status_pagamento || 'pendente'
    };
  }) || [];

  // Convert branches to match expected format
  const formattedBranches = branches?.map((branch: any) => ({
    id: String(branch.id),
    nome: branch.nome,
    cidade: branch.cidade,
    estado: branch.estado
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5 px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-start sm:items-center gap-3">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-olimpics-green-primary flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-olimpics-green-primary text-base sm:text-xl line-clamp-2">
                Gerenciamento de Perfis de Usuário
              </CardTitle>
              <CardDescription className="mt-1 sm:mt-1.5 text-xs sm:text-sm">
                Total de usuários registrados: {totalUsers}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <UserCreationDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="overflow-x-auto">
            <UserProfilesTable
              data={formattedUserProfiles}
              branches={formattedBranches}
              isLoading={isLoadingAthletes || isLoadingProfiles}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
