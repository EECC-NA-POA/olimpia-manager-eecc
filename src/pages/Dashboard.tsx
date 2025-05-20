
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import { usePrivacyPolicyCheck } from '@/hooks/usePrivacyPolicyCheck';
import { PrivacyPolicyAcceptanceModal } from '@/components/auth/PrivacyPolicyAcceptanceModal';
import { LoadingState } from '@/components/dashboard/components/LoadingState';

const Dashboard = () => {
  const { user, currentEventId, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the user needs to accept the privacy policy
  const { 
    needsAcceptance, 
    checkCompleted,
    refetchCheck 
  } = usePrivacyPolicyCheck();

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

  const handlePrivacyPolicyAccept = async () => {
    await refetchCheck();
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
  
  // Show the privacy policy modal if needed
  if (needsAcceptance) {
    return (
      <PrivacyPolicyAcceptanceModal
        onAccept={handlePrivacyPolicyAccept}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="w-full">
      <AthleteProfilePage />
    </div>
  );
};

export default Dashboard;
