
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import { WelcomePolicyBranchModal } from '@/components/auth/WelcomePolicyBranchModal';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@/hooks/useNavigation';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import Administration from '@/pages/Administration';
import JudgeDashboard from '@/pages/JudgeDashboard';
import DelegationDashboard from '@/components/DelegationDashboard';
import MonitorDashboard from '@/components/monitor/MonitorDashboard';

const Dashboard = () => {
  const { user, currentEventId, signOut } = useAuth();
  const { roles } = useNavigation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [needsBranchSelection, setNeedsBranchSelection] = useState(false);

  // Check if user has a branch associated
  useEffect(() => {
    const checkUserBranch = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking user branch:', error);
          return;
        }
        
        setNeedsBranchSelection(!data.filial_id);
      } catch (err) {
        console.error('Error in checkUserBranch:', err);
      }
    };
    
    if (user?.id) {
      checkUserBranch();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      console.log('Dashboard - User not authenticated, redirecting to /login');
      navigate('/login');
      toast.error('Você precisa estar logado para acessar essa página.');
      return;
    }

    if (!currentEventId) {
      console.log('Dashboard - No event selected, redirecting to /event-selection');
      navigate('/event-selection');
      toast.warning('Por favor, selecione um evento para continuar.');
      return;
    }

    // Only set loading to false when auth checks are done
    setIsLoading(false);
  }, [user, currentEventId, navigate]);

  // Role-based routing effect
  useEffect(() => {
    if (!user || !currentEventId || isLoading || needsBranchSelection) return;

    console.log('=== DASHBOARD ROLE-BASED ROUTING ===');
    console.log('User roles detected:', roles);
    console.log('User papeis:', user.papeis);
    console.log('Current path:', window.location.pathname);
    
    // Determine primary role and redirect appropriately
    const currentPath = window.location.pathname;
    
    // Don't redirect if already on the correct dashboard
    if (currentPath.includes('/organizador') || 
        currentPath.includes('/administration') || 
        currentPath.includes('/judge-dashboard') ||
        currentPath.includes('/delegacao') ||
        currentPath.includes('/monitor') ||
        currentPath.includes('/athlete-profile')) {
      console.log('Already on appropriate dashboard, skipping redirect');
      return;
    }

    // Role priority order: Admin > Organizer > Judge > Delegation > Monitor > Athlete
    if (roles.isAdmin) {
      console.log('Redirecting to Administration (Admin role)');
      navigate('/administration', { replace: true });
    } else if (roles.isOrganizer) {
      console.log('Redirecting to Organizer Dashboard');
      navigate('/organizador', { replace: true });
    } else if (roles.isJudge) {
      console.log('Redirecting to Judge Dashboard');
      navigate('/judge-dashboard', { replace: true });
    } else if (roles.isDelegationRep) {
      console.log('Redirecting to Delegation Dashboard');
      navigate('/delegacao', { replace: true });
    } else if (roles.isFilosofoMonitor) {
      console.log('Redirecting to Monitor Dashboard');
      navigate('/monitor', { replace: true });
    } else {
      console.log('Redirecting to Athlete Profile (default)');
      navigate('/athlete-profile', { replace: true });
    }
    console.log('====================================');
  }, [user, currentEventId, isLoading, needsBranchSelection, roles, navigate]);

  const handlePreferencesComplete = async () => {
    // Force reload of user to get updated branch info
    window.location.reload();
  };
  
  const handleCancel = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show the welcome modal if needed
  const showWelcomeModal = needsBranchSelection;
  
  if (showWelcomeModal) {
    return (
      <WelcomePolicyBranchModal
        isOpen={true}
        onClose={handleCancel}
        needsLocationSelection={needsBranchSelection}
        existingBranchId={user?.filial_id}
        existingState={undefined} // We need to fetch this if needed
        onComplete={handlePreferencesComplete}
      />
    );
  }

  // Render appropriate dashboard based on roles
  const renderDashboard = () => {
    console.log('=== DASHBOARD RENDER DECISION ===');
    console.log('Roles:', roles);
    console.log('Current path:', window.location.pathname);
    
    // Role priority order: Admin > Organizer > Judge > Delegation > Monitor > Athlete
    if (roles.isAdmin) {
      console.log('Rendering Administration');
      return <Administration />;
    } else if (roles.isOrganizer) {
      console.log('Rendering OrganizerDashboard');
      return <OrganizerDashboard />;
    } else if (roles.isJudge) {
      console.log('Rendering JudgeDashboard');
      return <JudgeDashboard />;
    } else if (roles.isDelegationRep) {
      console.log('Rendering DelegationDashboard');
      return <DelegationDashboard />;
    } else if (roles.isFilosofoMonitor) {
      console.log('Rendering MonitorDashboard');
      return <MonitorDashboard />;
    } else {
      console.log('Rendering AthleteProfilePage (default)');
      return <AthleteProfilePage />;
    }
  };

  return (
    <div className="w-full">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
