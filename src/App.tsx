
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import AthleteProfilePage from './components/AthleteProfilePage';
import SchedulePage from './pages/Cronograma';
import RegulationsPage from './pages/EventRegulations';
import AthleteRegistrationsPage from './components/AthleteRegistrations';
import OrganizerDashboard from './components/OrganizerDashboard';
import DelegationDashboard from './components/DelegationDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdministrationPage from './pages/Administration';
import EventManagementPage from './pages/EventManagement';
import EventSelectionPage from './pages/EventSelectionPage';
import DelegationTeamsPage from '@/components/DelegationTeamsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/event-selection" element={<EventSelectionPage />} />
              <Route path="/" element={<EventSelectionPage />} />
              <Route
                path="/athlete-profile"
                element={
                  <ProtectedRoute allowedRoles={['ATL', 'ORE', 'RDD', 'ADM']}>
                    <Layout>
                      <AthleteProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cronograma"
                element={
                  <ProtectedRoute allowedRoles={['ATL', 'ORE', 'RDD', 'ADM']}>
                    <Layout>
                      <SchedulePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/regulamento"
                element={
                  <ProtectedRoute allowedRoles={['ATL', 'ORE', 'RDD', 'ADM']}>
                    <Layout>
                      <RegulationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minhas-inscricoes"
                element={
                  <ProtectedRoute allowedRoles={['ATL', 'ORE', 'RDD', 'ADM']}>
                    <Layout>
                      <AthleteRegistrationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ORE']}>
                    <Layout>
                      <OrganizerDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delegation-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RDD']}>
                    <Layout>
                      <DelegationDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['JUZ']}>
                    <Layout>
                      <JudgeDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/administration"
                element={
                  <ProtectedRoute allowedRoles={['ADM']}>
                    <Layout>
                      <AdministrationPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/event-management"
                element={
                  <ProtectedRoute allowedRoles={['ADM']}>
                    <Layout>
                      <EventManagementPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/delegacao-equipes" 
                element={
                  <ProtectedRoute allowedRoles={['RDD']}>
                    <Layout>
                      <DelegationTeamsPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
