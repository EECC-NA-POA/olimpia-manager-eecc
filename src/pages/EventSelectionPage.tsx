
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EventSelectionContainer } from '@/components/event-selection/EventSelectionContainer';

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logs to help diagnose issues
  useEffect(() => {
    if (user) {
      console.log('User data:', user);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return <EventSelectionContainer />;
}
