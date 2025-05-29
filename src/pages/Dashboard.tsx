
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import { usePrivacyPolicyCheck } from '@/hooks/usePrivacyPolicyCheck';
import { WelcomePolicyBranchModal } from '@/components/auth/WelcomePolicyBranchModal';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { user, currentEventId, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [needsBranchSelection, setNeedsBranchSelection] = useState(false);
  
  // Check if the user needs to accept the privacy policy
  const { 
    needsAcceptance, 
    checkCompleted,
    refetchCheck 
  } = usePrivacyPolicyCheck();

  // Check if user has a branch associated
  useEffect(() => {
    const checkUserBranch = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking user branch:', error);
          return;
        }
        
        setNeedsBranchSelection(!data.filial_id);
      } catch (err) {
        console.error('Error in checkUserBranch:', err);
      }
    };
    
    if (user?.id) {
      checkUserBranch();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      console.log('Dashboard - User not authenticated, redirecting to /login');
      navigate('/login');
      toast.error('Você precisa estar logado para acessar essa página.');
      return;
    }

    if (!currentEventId) {
      console.log('Dashboard - No event selected, redirecting to /event-selection');
      navigate('/event-selection');
      toast.warning('Por favor, selecione um evento para continuar.');
      return;
    }

    // Only set loading to false when both auth checks and policy check are done
    if (checkCompleted) {
      setIsLoading(false);
    }
  }, [user, currentEventId, navigate, checkCompleted]);

  const handlePreferencesComplete = async () => {
    await refetchCheck();
    // Force reload of user to get updated branch info
    window.location.reload();
  };
  
  const handleCancel = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show the welcome modal if needed
  const showWelcomeModal = needsAcceptance || needsBranchSelection;
  
  if (showWelcomeModal) {
    return (
      <WelcomePolicyBranchModal
        isOpen={true}
        onClose={handleCancel}
        needsLocationSelection={needsBranchSelection}
        existingBranchId={user?.filial_id}
        existingState={undefined} // We need to fetch this if needed
        onComplete={handlePreferencesComplete}
      />
    );
  }

  return <AthleteProfilePage />;
};

export default Dashboard;
