
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import './styles/index.css'; // Updated import path
import { GlobalHeader } from './components/GlobalHeader';
import { PUBLIC_ROUTES } from './constants/routes';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import DelegationDashboard from './components/DelegationDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import EventSelectionPage from './pages/EventSelectionPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import RejectedAccess from './pages/RejectedAccess';
import Scores from './pages/Scores';
import Cronograma from './pages/Cronograma';
import Administration from './pages/Administration';
import EventManagement from './pages/EventManagement';
import AthleteRegistrations from './components/AthleteRegistrations';
import EventRegulations from './pages/EventRegulations';

// Import providers and components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/AuthProvider';
import { MobileNavigationLink } from './components/footer/MobileNavigation';
import Footer from './components/Footer';
import { MainNavigation } from './components/MainNavigation';

// Create a component to set the current route as a data-attribute on the body
const RouteObserver = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    document.body.setAttribute('data-current-route', location.pathname);
    return () => {
      document.body.removeAttribute('data-current-route');
    };
  }, [location.pathname]);
  
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Conditional Footer component that only appears on public routes
const ConditionalFooter = () => {
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname as any);
  
  return isPublicRoute ? <Footer /> : null;
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <GlobalHeader />
        <div className={`flex-grow ${isHomePage ? 'home-page' : 'mt-8'}`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="/acesso-negado" element={<RejectedAccess />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/event-selection" element={<EventSelectionPage />} />
            
            {/* Authenticated routes with top navigation */}
            <Route element={<MainNavigation />}>
              <Route path="/athlete-profile" element={<Dashboard />} />
              <Route path="/athlete-registrations" element={<AthleteRegistrations />} />
              <Route path="/delegation-dashboard" element={<DelegationDashboard />} />
              <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
              <Route path="/scores" element={<Scores />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/regulamento" element={<EventRegulations />} />
              <Route path="/administration" element={<Administration />} />
              <Route path="/event-management" element={<EventManagement />} />
              <Route path="/judge-dashboard" element={<JudgeDashboard />} />
            </Route>
          </Routes>
        </div>
        <MobileNavigationLink />
        <ConditionalFooter />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteObserver />
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
