
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

  // Fetch user profiles for ALL events (not just this event)
  const { 
    data: userProfiles,
    isLoading: isLoadingProfiles
  } = useQuery({
    queryKey: ['user-profiles-all', eventId],
    queryFn: async () => {
      if (!athletes?.length) {
        console.log('===== NO ATHLETES =====');
        return [];
      }
      
      console.log('===== FETCHING ALL USER PROFILES =====');
      const userIds = athletes.map(athlete => athlete.id);
      console.log('User IDs to fetch profiles for:', userIds);
      
      // Get all profiles for these users (not filtered by event)
      const { data: profilesData, error } = await supabase
        .from('papeis_usuarios')
        .select(`
          usuario_id,
          perfil_id,
          evento_id,
          perfis:perfil_id (
            nome,
            codigo
          )
        `)
        .in('usuario_id', userIds);

      console.log('===== ALL PROFILES QUERY RESULT =====');
      console.log('Profiles data:', profilesData);
      console.log('Profiles error:', error);
      console.log('Profiles count:', profilesData?.length || 0);
      console.log('==================================');

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      return profilesData || [];
    },
    enabled: !!athletes?.length && hasAdminProfile,
    staleTime: 0
  });
  
  console.log('===== ATHLETES DATA =====');
  console.log('Athletes:', athletes);
  console.log('Athletes count:', athletes?.length);
  console.log('User Profiles:', userProfiles);
  console.log('Loading athletes:', isLoadingAthletes);
  console.log('Loading profiles:', isLoadingProfiles);
  console.log('Error:', athletesError);
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
    // Get the user's profiles for this event
    const athleteProfiles = userProfiles?.filter((profile: any) => 
      profile.usuario_id === athlete.id
    ) || [];

    console.log(`===== ATHLETE ${athlete.nome_atleta} =====`);
    console.log('Athlete ID:', athlete.id);
    console.log('Found profiles:', athleteProfiles);
    console.log('Profiles mapped:', athleteProfiles.map((profile: any) => ({
      id: profile.perfil_id,
      nome: profile.perfis?.nome || '',
      codigo: profile.perfis?.codigo || ''
    })));
    console.log('=======================================');

    return {
      id: athlete.id,
      nome_completo: athlete.nome_atleta,
      email: athlete.email,
      numero_documento: athlete.numero_documento,
      tipo_documento: athlete.tipo_documento,
      filial_id: athlete.filial_id,
      created_at: new Date().toISOString(), // Use current date as fallback
      papeis: athleteProfiles.map((profile: any) => ({
        id: profile.perfil_id,
        nome: profile.perfis?.nome || '',
        codigo: profile.perfis?.codigo || ''
      })),
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
