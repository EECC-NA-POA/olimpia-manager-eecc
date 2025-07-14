
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfiles, fetchBranches } from '@/lib/api';
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
  console.log('EventAdministrationSection - User:', user);
  console.log('EventAdministrationSection - HasAdminProfile:', hasAdminProfile);

  const { 
    data: userProfiles,
    isLoading: isLoadingProfiles,
    refetch: refetchUserProfiles,
    error: profilesError
  } = useQuery({
    queryKey: ['user-profiles', eventId],
    queryFn: () => {
      console.log('Executing fetchUserProfiles query with eventId:', eventId);
      return fetchUserProfiles(eventId);
    },
    enabled: hasAdminProfile && !!eventId
  });
  
  console.log('EventAdministrationSection - UserProfiles data:', userProfiles);
  console.log('EventAdministrationSection - ProfilesError:', profilesError);
  console.log('EventAdministrationSection - IsLoadingProfiles:', isLoadingProfiles);

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
      refetchUserProfiles();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [refetchUserProfiles, queryClient]);

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

  const totalUsers = userProfiles?.length || 0;

  // Convert API data to match UserProfile interface
  const formattedUserProfiles = userProfiles?.map((profile: any) => ({
    id: profile.id,
    nome_completo: profile.nome_completo,
    email: profile.email,
    numero_documento: profile.numero_documento,
    tipo_documento: profile.tipo_documento,
    filial_id: profile.filial_id,
    created_at: profile.created_at,
    papeis: profile.profiles?.map((p: any) => ({
      id: p.perfil_id,
      nome: p.perfil_nome,
      codigo: p.perfil_nome || ''
    })) || [],
    pagamentos: profile.pagamentos || [],
    // Use the calculated status_pagamento from the API
    status_pagamento: profile.status_pagamento || 'pendente'
  })) || [];

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
              isLoading={isLoadingProfiles}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
