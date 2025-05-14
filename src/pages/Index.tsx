
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('Index component - Current event ID:', currentEventId);
  
  // If user is authenticated
  if (user) {
    // If they have an event selected, go to home
    if (currentEventId) {
      console.log('User is authenticated with event selected, redirecting to /home');
      return <Navigate to="/home" replace />;
    }
    
    // If user is authenticated but no event selected, go to event selection
    console.log('User is authenticated but no event selected, redirecting to /event-selection');
    return <Navigate to="/event-selection" replace />;
  }
  
  // If user is not authenticated, show the landing page
  console.log('User is not authenticated, displaying landing page');
  return <LandingPage />;
};

export default Index;
