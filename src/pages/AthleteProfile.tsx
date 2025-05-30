
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { MainNavigation } from '@/components/MainNavigation';
import { LoadingImage } from '@/components/ui/loading-image';

export default function AthleteProfile() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();

  // Redirect if no user or no event selected
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!currentEventId) {
      navigate('/event-selection');
      return;
    }
  }, [user, currentEventId, navigate]);

  if (!user || !currentEventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingImage text="Carregando..." />
      </div>
    );
  }

  return <MainNavigation />;
}
