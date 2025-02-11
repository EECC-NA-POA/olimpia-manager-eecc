
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfiles, fetchBranches } from '@/lib/api';
import { UserProfilesTable } from '@/components/dashboard/UserProfilesTable';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Administration() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has admin profile
  const hasAdminProfile = user?.papeis?.includes('Administração');

  useEffect(() => {
    if (!hasAdminProfile) {
      toast.error('Acesso restrito a administradores');
      navigate('/');
    }
  }, [hasAdminProfile, navigate]);

  const { 
    data: userProfiles,
    isLoading: isLoadingProfiles
  } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: fetchUserProfiles,
    enabled: hasAdminProfile
  });

  const { 
    data: branches
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    enabled: hasAdminProfile
  });

  if (!hasAdminProfile) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
          Administração
        </h1>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-4 text-olimpics-text">
          Gerenciamento de Perfis de Usuário
        </h2>
        <UserProfilesTable
          data={userProfiles || []}
          branches={branches || []}
          isLoading={isLoadingProfiles}
        />
      </div>
    </div>
  );
}
