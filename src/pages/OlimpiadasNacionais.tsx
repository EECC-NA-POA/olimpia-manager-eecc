
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EventsLandingContainer } from '@/components/events-landing/EventsLandingContainer';

const OlimpiadasNacionais = () => {
  const { user, currentEventId } = useAuth();
  
  console.log('OlimpiadasNacionais component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  console.log('OlimpiadasNacionais component - Current event ID:', currentEventId);
  
  // Show the events landing container for the Olimpiadas Nacionais
  return <EventsLandingContainer />;
};

export default OlimpiadasNacionais;
