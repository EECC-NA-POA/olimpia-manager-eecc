
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Calendar } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfiles, fetchBranches } from '@/lib/api';
import { UserProfilesTable } from '@/components/dashboard/UserProfilesTable';
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

  const { 
    data: userProfiles,
    isLoading: isLoadingProfiles,
    refetch: refetchUserProfiles
  } = useQuery({
    queryKey: ['user-profiles', eventId],
    queryFn: () => fetchUserProfiles(eventId),
    enabled: hasAdminProfile && !!eventId
  });

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
          <p className="text-center text-muted-foreground">
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
          <p className="text-center text-muted-foreground">
            Acesso restrito a administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = userProfiles?.length || 0;

  return (
    <div className="space-y-6">
      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-olimpics-green-primary" />
            <div>
              <CardTitle className="text-olimpics-green-primary text-xl">
                Administração do Evento
              </CardTitle>
              <CardDescription className="mt-1.5">
                Gerencie perfis de usuários e configurações administrativas do evento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-olimpics-green-primary" />
            <div>
              <CardTitle className="text-olimpics-green-primary text-xl">
                Gerenciamento de Perfis de Usuário
              </CardTitle>
              <CardDescription className="mt-1.5">
                Total de usuários registrados: {totalUsers}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <UserProfilesTable
            data={userProfiles || []}
            branches={branches || []}
            isLoading={isLoadingProfiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}
