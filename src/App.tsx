import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/AuthProvider';
import { SessionTimeoutProvider } from './components/providers/SessionTimeoutProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { SidebarProvider } from './components/ui/sidebar';
import { GlobalHeader } from './components/GlobalHeader';
import { MainNavigation } from './components/MainNavigation';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { FloatingNotificationIcon } from './components/notifications/FloatingNotificationIcon';
import { useAuth } from './contexts/AuthContext';

// Imports for all pages
import Index from './pages/Index';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import EventSelectionPage from './pages/EventSelectionPage';
import AthleteProfile from './pages/AthleteProfile';
import Cronograma from './pages/Cronograma';
import EventRegulations from './pages/EventRegulations';
import Scores from './pages/Scores';
import OrganizerPage from './pages/OrganizerPage';
import DelegationPage from './pages/DelegationPage';
import JudgeDashboard from './pages/JudgeDashboard';
import Administration from './pages/Administration';
import EventManagement from './pages/EventManagement';
import Dashboard from './pages/Dashboard';
import RejectedAccess from './pages/RejectedAccess';
import PublicEventPage from './pages/PublicEventPage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventsLandingPage from './pages/EventsLandingPage';
import LandingPage from './pages/LandingPage';
import OlimpiadasNacionais from './pages/OlimpiadasNacionais';

import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  
  const isPublicRoute = [
    '/',
    '/login',
    '/forgot-password', 
    '/reset-password',
    '/verify-email',
    '/events',
    '/rejected-access'
  ].includes(location.pathname) || location.pathname.startsWith('/event/');

  const hideNavigation = [
    '/event-selection',
    '/rejected-access'
  ].includes(location.pathname) || location.pathname.startsWith('/event/');

  const showFloatingIcon = user && !isPublicRoute && !hideNavigation;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      {user && !hideNavigation && <MainNavigation />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/events" element={<EventsLandingPage />} />
          <Route path="/event/:slug" element={<PublicEventPage />} />
          <Route path="/event/:slug/details" element={<EventDetailsPage />} />
          <Route path="/landing/:eventSlug" element={<LandingPage />} />
          <Route path="/olimpiadas-nacionais" element={<OlimpiadasNacionais />} />
          
          {/* Protected Routes */}
          <Route 
            path="/event-selection" 
            element={user ? <EventSelectionPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/athlete-profile" 
            element={user ? <AthleteProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cronograma" 
            element={user ? <Cronograma /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/regulamento" 
            element={user ? <EventRegulations /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/athlete-registrations" 
            element={user ? <AthleteProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/scores" 
            element={user ? <Scores /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/organizer-dashboard" 
            element={user ? <OrganizerPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/delegation-dashboard" 
            element={user ? <DelegationPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/judge-dashboard" 
            element={user ? <JudgeDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/administration" 
            element={user ? <Administration /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/event-management" 
            element={user ? <EventManagement /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/rejected-access" element={<RejectedAccess />} />
        </Routes>
      </main>

      {!isPublicRoute && <Footer />}
      {showFloatingIcon && <FloatingNotificationIcon />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <SessionTimeoutProvider>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </SessionTimeoutProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
