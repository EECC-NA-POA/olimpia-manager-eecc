
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const OlimpiadasNacionais = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('OlimpiadasNacionais component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('OlimpiadasNacionais component - Current event ID:', currentEventId);
  
  // Always show the landing page as the main page
  // Users can navigate to specific events or login from there
  return <LandingPage />;
};

export default OlimpiadasNacionais;
