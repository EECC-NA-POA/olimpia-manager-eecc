import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingImage } from '@/components/ui/loading-image';
import { AthleteDashboardContent } from '@/components/athlete-dashboard/AthleteDashboardContent';

export default function AthleteDashboard() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();

  // Redirect if no event selected
  React.useEffect(() => {
    if (!currentEventId) {
      navigate('/event-selection', { replace: true });
    }
  }, [currentEventId, navigate]);

  if (!user || !currentEventId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingImage />
      </div>
    );
  }

  return <AthleteDashboardContent userId={user.id} eventId={currentEventId} />;
}
