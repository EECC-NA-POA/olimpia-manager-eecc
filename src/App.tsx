
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from '@/pages/VerifyEmail';
import EventSelectionPage from '@/pages/EventSelectionPage';
import Dashboard from '@/pages/Dashboard';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import Administration from '@/pages/Administration';
import EventManagement from '@/pages/EventManagement';
import JudgeDashboard from '@/pages/JudgeDashboard';
import Cronograma from '@/pages/Cronograma';
import EventRegulations from '@/pages/EventRegulations';
import Scores from '@/pages/Scores';
import EventDetailsPage from '@/pages/EventDetailsPage';
import OlimpiadasNacionais from '@/pages/OlimpiadasNacionais';
import EventsLandingPage from '@/pages/EventsLandingPage';
import PublicEventPage from '@/pages/PublicEventPage';
import RejectedAccess from '@/pages/RejectedAccess';
import LandingPage from '@/pages/LandingPage';
import AthleteRegistrations from '@/components/AthleteRegistrations';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/olimpiadas-nacionais" element={<OlimpiadasNacionais />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/verificar-email" element={<VerifyEmail />} />
              <Route path="/event-selection" element={<EventSelectionPage />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/athlete-profile" element={<AthleteProfilePage />} />
              <Route path="/admin" element={<Administration />} />
              <Route path="/event-management" element={<EventManagement />} />
              <Route path="/judge-dashboard" element={<JudgeDashboard />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/regulamento" element={<EventRegulations />} />
              <Route path="/athlete-registrations" element={<AthleteRegistrations />} />
              <Route path="/scores" element={<Scores />} />
              <Route path="/event/:eventId" element={<EventDetailsPage />} />
              <Route path="/events" element={<EventsLandingPage />} />
              <Route path="/event/:slug" element={<PublicEventPage />} />
              <Route path="/acesso-negado" element={<RejectedAccess />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
