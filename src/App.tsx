
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/GlobalHeader";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import AthleteProfile from "@/pages/AthleteProfile";
import Dashboard from "@/pages/Dashboard";
import JudgeDashboard from "@/pages/JudgeDashboard";
import MonitorPage from "@/pages/MonitorPage";
import DelegationPage from "@/pages/DelegationPage";
import EventsLandingPage from "@/pages/EventsLandingPage";
import EventSelectionPage from "@/pages/EventSelectionPage";
import OrganizerPage from "@/pages/OrganizerPage";
import EventManagement from "@/pages/EventManagement";
import SessionDetailsPage from "@/components/monitor/SessionDetailsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <GlobalHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/athlete" element={<AthleteProfile />} />
                  <Route path="/athlete-profile" element={<AthleteProfile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/judge" element={<JudgeDashboard />} />
                  <Route path="/monitor" element={<MonitorPage />} />
                  <Route path="/monitor/session/:sessionId" element={<SessionDetailsPage />} />
                  <Route path="/delegation" element={<DelegationPage />} />
                  <Route path="/events" element={<EventsLandingPage />} />
                  <Route path="/event-selection" element={<EventSelectionPage />} />
                  <Route path="/organizer/events" element={<OrganizerPage />} />
                  <Route path="/organizer/events/:eventId" element={<EventManagement />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
