
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EventsLandingPage from './EventsLandingPage';

const Index = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('Index component - Current event ID:', currentEventId);
  
  // Always show the events landing page as the main page
  // Users can navigate to specific events or login from there
  return <EventsLandingPage />;
};

export default Index;
