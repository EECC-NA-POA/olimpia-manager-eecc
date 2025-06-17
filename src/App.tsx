
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GlobalHeader from "@/components/GlobalHeader";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AthleteProfile from "@/pages/AthleteProfile";
import DashboardPage from "@/pages/DashboardPage";
import JudgePage from "@/pages/JudgePage";
import MonitorPage from "@/pages/MonitorPage";
import DelegationPage from "@/pages/DelegationPage";
import EventsLanding from "@/pages/EventsLanding";
import EventSelection from "@/pages/EventSelection";
import OrganizerEventsPage from "@/pages/OrganizerEventsPage";
import OrganizerEventManagementPage from "@/pages/OrganizerEventManagementPage";
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
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/athlete" element={<AthleteProfile />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/judge" element={<JudgePage />} />
                  <Route path="/monitor" element={<MonitorPage />} />
                  <Route path="/monitor/session/:sessionId" element={<SessionDetailsPage />} />
                  <Route path="/delegation" element={<DelegationPage />} />
                  <Route path="/events" element={<EventsLanding />} />
                  <Route path="/event-selection" element={<EventSelection />} />
                  <Route path="/organizer/events" element={<OrganizerEventsPage />} />
                  <Route path="/organizer/events/:eventId" element={<OrganizerEventManagementPage />} />
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
