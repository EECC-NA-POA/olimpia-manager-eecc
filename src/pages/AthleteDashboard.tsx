import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AthleteDashboardContent userId={user.id} eventId={currentEventId} />;
}
