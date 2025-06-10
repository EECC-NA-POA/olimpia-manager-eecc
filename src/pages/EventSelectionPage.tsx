
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EventSelectionContainer } from '@/components/event-selection/EventSelectionContainer';

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();

  // Debug logs to help diagnose issues
  useEffect(() => {
    if (user) {
      console.log('User data:', user);
    }
    
    if (currentEventId) {
      console.log('Current event ID in EventSelectionPage:', currentEventId);
    }
  }, [user, currentEventId]);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return <EventSelectionContainer />;
}
