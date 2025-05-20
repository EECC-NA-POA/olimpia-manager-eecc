
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AthleteProfilePage from '@/components/AthleteProfilePage';

const Dashboard = () => {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      // Change toast.warn to toast.warning as per the available methods
      toast.warning('Por favor, selecione um evento para continuar.');
      return;
    }

    setIsLoading(false);
  }, [user, currentEventId, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-y-auto pb-20">
      <div className="container mx-auto p-4">
        <AthleteProfilePage />
      </div>
    </div>
  );
};

export default Dashboard;
