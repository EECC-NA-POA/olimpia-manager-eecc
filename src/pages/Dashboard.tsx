
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    <div className="home-page">
      <div className="container mx-auto p-4">
        {/* Use nome_completo instead of nome to match the AuthUser type */}
        <h1 className="text-2xl font-semibold mb-4">Bem-vindo(a), {user?.nome_completo || user?.email}!</h1>
        <p>Você está logado e pronto para começar.</p>
        {user?.papeis && user.papeis.length > 0 && (
          <div>
            <p>Seus papéis:</p>
            <ul>
              {/* Use the codigo property as key instead of id since id is not present in UserRole */}
              {user.papeis.map((role) => (
                <li key={role.codigo}>{role.nome}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
