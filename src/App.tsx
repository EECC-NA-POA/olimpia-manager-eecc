import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SessionTimeoutProvider } from "@/components/providers/SessionTimeoutProvider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Footer } from "@/components/Footer";
import { MainNavigation } from "@/components/MainNavigation";
import { FloatingNotificationIcon } from "@/components/notifications/FloatingNotificationIcon";

import Index from "./pages/Index";
import OlimpiadasNacionais from "./pages/OlimpiadasNacionais";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventSelectionPage from "./pages/EventSelectionPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import PublicEventPage from "./pages/PublicEventPage";
import EventsLandingPage from "./pages/EventsLandingPage";
import JudgeDashboard from "./pages/JudgeDashboard";
import Administration from "./pages/Administration";
import EventRegulations from "./pages/EventRegulations";
import Cronograma from "./pages/Cronograma";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import RejectedAccess from "./pages/RejectedAccess";
import AthleteProfile from "./pages/AthleteProfile";
import Notifications from "./pages/Notifications";
import Scores from "./pages/Scores";
import OrganizerDashboard from "@/components/OrganizerDashboard";
import DelegationDashboard from "@/components/DelegationDashboard";
import AthleteRegistrations from "@/components/AthleteRegistrations";

// Import Filosofo Monitor component
import MonitorDashboard from "@/components/monitor/MonitorDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Não tentar novamente em erros de autenticação
        if (error?.message?.includes('JWT') || 
            error?.message?.includes('refresh_token_not_found') || 
            error?.message?.includes('token') ||
            error?.message?.includes('invalid session')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      <main className="flex-1">
        <Routes>
          {/* Public routes without sidebar */}
          <Route path="/" element={<Index />} />
          <Route path="/olimpiadas-nacionais" element={<OlimpiadasNacionais />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<EventsLandingPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/event/:slug" element={<PublicEventPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/acesso-negado" element={<RejectedAccess />} />
          
          {/* Event selection without sidebar */}
          <Route path="/event-selection" element={<EventSelectionPage />} />
          
          {/* Protected routes with sidebar */}
          <Route path="/*" element={
            <MainNavigation>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/athlete-profile" element={<AthleteProfile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/judge-dashboard" element={<JudgeDashboard />} />
                <Route path="/administration" element={<Administration />} />
                <Route path="/regulamento" element={<EventRegulations />} />
                <Route path="/cronograma" element={<Cronograma />} />
                <Route path="/scores" element={<Scores />} />
                <Route path="/minhas-inscricoes" element={<AthleteRegistrations />} />
                <Route path="/organizador" element={<OrganizerDashboard />} />
                <Route path="/delegacao" element={<DelegationDashboard />} />
                
                {/* Filosofo Monitor consolidated route */}
                <Route path="/monitor" element={<MonitorDashboard />} />
              </Routes>
            </MainNavigation>
          } />
        </Routes>
      </main>
      <Footer />
      
      {/* Floating notification icon - only shows when there are unread notifications */}
      <FloatingNotificationIcon />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SessionTimeoutProvider>
              <AppContent />
            </SessionTimeoutProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
