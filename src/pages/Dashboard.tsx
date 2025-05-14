
import { useAuth } from '@/contexts/AuthContext';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import DelegationDashboard from '@/components/DelegationDashboard';
import { NoEventSelected } from '@/components/dashboard/components/NoEventSelected';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, currentEventId } = useAuth();
  console.log("Usuário carregado no dashboard:", user);
  console.log("Event ID no dashboard:", currentEventId);

  // If no event is selected, show the NoEventSelected component
  if (!currentEventId) {
    console.log("No event selected in Dashboard, showing NoEventSelected component");
    return <NoEventSelected />;
  }

  const isAthlete = user?.papeis?.some(role => role.codigo === 'ATL');
  const isOrganizer = user?.papeis?.some(role => role.codigo === 'ORE');
  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD');

  if (isAthlete) {
    return <AthleteProfilePage />;
  } else if (isOrganizer) {
    return <Navigate to="/organizer-dashboard" replace />;
  } else if (isDelegationRep) {
    return <Navigate to="/delegation-dashboard" replace />;
  } else {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-olimpics-green-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.nome_completo}!
        </p>
      </div>
    );
  }
}
