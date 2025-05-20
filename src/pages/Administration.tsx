
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfiles, fetchBranches } from '@/lib/api';
import { UserProfilesTable } from '@/components/dashboard/UserProfilesTable';
import { useAuth } from '@/contexts/AuthContext';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Administration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentEventId = localStorage.getItem('currentEventId');
  const { canCreateEvents, isLoading: isLoadingPermission } = useCanCreateEvents();

  // Check if user has admin profile
  const hasAdminProfile = user?.papeis?.some(role => role.codigo === 'ADM');

  useEffect(() => {
    if (!hasAdminProfile) {
      toast.error('Acesso restrito a administradores');
      navigate('/');
    }

    if (!currentEventId) {
      toast.error('Nenhum evento selecionado');
      navigate('/event-selection');
    }
  }, [hasAdminProfile, navigate, currentEventId]);

  const { 
    data: userProfiles,
    isLoading: isLoadingProfiles,
    refetch: refetchUserProfiles
  } = useQuery({
    queryKey: ['user-profiles', currentEventId],
    queryFn: () => fetchUserProfiles(currentEventId),
    enabled: hasAdminProfile && !!currentEventId
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

  if (!hasAdminProfile || !currentEventId) {
    return null;
  }

  const totalUsers = userProfiles?.length || 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
          Administração
        </h1>
        
        {canCreateEvents && (
          <Button 
            onClick={() => navigate('/event-management')}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Gerenciar Evento Atual
          </Button>
        )}
      </div>

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
