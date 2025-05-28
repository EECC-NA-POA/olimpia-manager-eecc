
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EventsLandingPage from './EventsLandingPage';

const Index = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('Index component - Current event ID:', currentEventId);
  
  // If user is authenticated and has an event selected, go to the event details page
  if (user && currentEventId) {
    console.log('User is authenticated with event selected, redirecting to event details');
    return <Navigate to={`/events/${currentEventId}`} replace />;
  }
  
  // If user is authenticated but no event selected, go to event selection
  if (user && !currentEventId) {
    console.log('User is authenticated but no event selected, redirecting to /event-selection');
    return <Navigate to="/event-selection" replace />;
  }
  
  // If user is not authenticated, show the events landing page
  console.log('User is not authenticated, displaying events landing page');
  return <EventsLandingPage />;
};

export default Index;
