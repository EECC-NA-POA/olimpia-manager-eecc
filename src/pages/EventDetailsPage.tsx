
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';

const EventDetailsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, setCurrentEventId } = useAuth();

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Set the current event ID when accessing this page
  React.useEffect(() => {
    if (eventId) {
      localStorage.setItem('currentEventId', eventId);
      setCurrentEventId(eventId);
    }
  }, [eventId, setCurrentEventId]);

  // Render the existing Dashboard component which contains all event functionality
  return <Dashboard />;
};

export default EventDetailsPage;
