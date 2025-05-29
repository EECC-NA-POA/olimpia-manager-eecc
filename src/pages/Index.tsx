
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  
  // Always show the informative landing page as the main page
  // Users can login/register from there to access events and system features
  return <LandingPage />;
};

export default Index;
