
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('Index component - Current event ID:', currentEventId);
  
  // Always show the landing page as the main page
  // Users can navigate to specific events or login from there
  return <LandingPage />;
};

export default Index;
