import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayoutEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import MobileLayout from './components/MobileLayout';
import { detectDeviceLanguage, getStoredLanguage } from '@/i18n';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

// Mobile Screens
import MobileDashboard from './screens/MobileDashboard';
import MobileEnrollments from './screens/MobileEnrollments';
import MobileSchedule from './screens/MobileSchedule';
import MobilePayment from './screens/MobilePayment';
import MobileScores from './screens/MobileScores';
import MobileRegulations from './screens/MobileRegulations';
import MobileNotifications from './screens/MobileNotifications';
import MobileCreateNotification from './screens/MobileCreateNotification';
import MobilePrivacyPolicy from './screens/MobilePrivacyPolicy';
import MobileAttendance from './screens/monitor/MobileAttendance';
import MobileProfile from './screens/MobileProfile';
import MobileLogin from './screens/MobileLogin';
import MobileRegister from './screens/MobileRegister';
import MobileForgotPassword from './screens/MobileForgotPassword';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Component to protect mobile routes
 */
function RequireMobileAuth({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log('🔒 RequireMobileAuth check:', { loading, hasUser: !!user, path: location.pathname });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/m/login" state={{ from: location }} replace />;
    }

    return children;
}

/**
 * MobileApp - Entry point for native mobile app
 * 
 * Renders a mobile-first layout with bottom tab navigation
 * Uses /m/ prefix for all mobile routes
 */
function MobileApp() {
    const { t, i18n } = useTranslation();

    useLayoutEffect(() => {
        const initLang = async () => {
            if (Capacitor.isNativePlatform()) {
                const stored = await getStoredLanguage();
                if (!stored) {
                    const deviceLang = await detectDeviceLanguage();
                    console.log('🌍 Enforcing device language:', deviceLang);
                    i18n.changeLanguage(deviceLang);
                }
            }
        };
        initLang();
    }, [i18n]);

    console.log('📱 MobileApp rendering...');

    // Initialize push notifications for mobile platforms
    usePushNotifications();

    console.log('🗺️ MobileApp routes ready');

    function MobileRoot() {
        const { user } = useAuth();
        return <Navigate to={user ? "/m/dashboard" : "/m/login"} replace />;
    }

    return (
        <Routes>
            {/* Redirect root based on auth state */}
            <Route path="/" element={<MobileRoot />} />


            {/* Mobile Auth (without layout) */}
            <Route path="/login" element={
                <ErrorBoundary>
                    <MobileLogin />
                </ErrorBoundary>
            } />
            <Route path="/m/login" element={
                <ErrorBoundary>
                    <MobileLogin />
                </ErrorBoundary>
            } />
            <Route path="/register" element={
                <ErrorBoundary>
                    <MobileRegister />
                </ErrorBoundary>
            } />
            <Route path="/m/register" element={
                <ErrorBoundary>
                    <MobileRegister />
                </ErrorBoundary>
            } />
            <Route path="/m/forgot-password" element={
                <ErrorBoundary>
                    <MobileForgotPassword />
                </ErrorBoundary>
            } />

            {/* Mobile routes with layout - Protected */}
            <Route path="/m/*" element={
                <RequireMobileAuth>
                    <MobileLayout>
                        <Routes>
                            <Route path="/dashboard" element={<MobileDashboard />} />
                            <Route path="/enrollments" element={<MobileEnrollments />} />
                            <Route path="/schedule" element={<MobileSchedule />} />
                            <Route path="/payment" element={<MobilePayment />} />
                            <Route path="/scores" element={<MobileScores />} />
                            <Route path="/regulations" element={<MobileRegulations />} />
                            <Route path="/notifications" element={<MobileNotifications />} />
                            <Route path="/notifications/create" element={<MobileCreateNotification />} />
                            <Route path="/privacy-policy" element={<MobilePrivacyPolicy />} />
                            {/* <Route path="/attendance" element={<MobileAttendance />} /> */}
                            <Route path="/profile" element={<MobileProfile />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/m/dashboard" replace />} />
                        </Routes>
                    </MobileLayout>
                </RequireMobileAuth>
            } />

            {/* Standalone Protected Routes (No Layout) */}
            <Route path="/m/attendance" element={
                <RequireMobileAuth>
                    <MobileAttendance />
                </RequireMobileAuth>
            } />

            {/* Catch all - redirect to mobile dashboard */}
            <Route path="*" element={<Navigate to="/m/dashboard" replace />} />
        </Routes>
    );
}

export default MobileApp;
