
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Footer } from "@/components/Footer";
import { MainNavigation } from "@/components/MainNavigation";
import { usePrivacyPolicyCheck } from "@/hooks/usePrivacyPolicyCheck";
import { PrivacyPolicyAcceptanceModal } from "@/components/auth/PrivacyPolicyAcceptanceModal";

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
import EventManagement from "./pages/EventManagement";
import EventRegulations from "./pages/EventRegulations";
import Cronograma from "./pages/Cronograma";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import RejectedAccess from "./pages/RejectedAccess";
import AthleteProfile from "./pages/AthleteProfile";
import Scores from "./pages/Scores";

const queryClient = new QueryClient();

function AppContent() {
  const { showModal, handleAccept, handleReject } = usePrivacyPolicyCheck();

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
                <Route path="/judge-dashboard" element={<JudgeDashboard />} />
                <Route path="/administration" element={<Administration />} />
                <Route path="/event-management" element={<EventManagement />} />
                <Route path="/regulamento" element={<EventRegulations />} />
                <Route path="/cronograma" element={<Cronograma />} />
                <Route path="/scores" element={<Scores />} />
                <Route path="/athlete-registrations" element={<Dashboard />} />
                <Route path="/organizer-dashboard" element={<Dashboard />} />
                <Route path="/delegation-dashboard" element={<Dashboard />} />
              </Routes>
            </MainNavigation>
          } />
        </Routes>
      </main>
      <Footer />
      
      {showModal && (
        <PrivacyPolicyAcceptanceModal
          onAccept={handleAccept}
          onCancel={handleReject}
        />
      )}
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
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
