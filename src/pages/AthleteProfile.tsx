
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { TabbedNavigation } from '@/components/navigation/TabbedNavigation';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import { LoadingImage } from '@/components/ui/loading-image';

export default function AthleteProfile() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const { roles } = useNavigation();

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

  return (
    <div className="min-h-screen flex flex-col">
      <TabbedNavigation user={user} roles={roles} />
      <main className="flex-1 bg-gray-50">
        <AthleteProfilePage />
      </main>
    </div>
  );
}
