import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, Bell, LogOut, CreditCard, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useAthletePaymentStatus } from '@/components/athlete-dashboard/hooks/useAthletePaymentStatus';
import MobileEventSelector from '../components/MobileEventSelector';
import { useQuery } from '@tanstack/react-query';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';

function MobileDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, currentEventId, setCurrentEventId } = useAuth();
    const { activeEvent, isLoading } = useActiveEvent();
    const [showEventSelector, setShowEventSelector] = useState(false);

    // Get payment status to show on dashboard
    const { data: paymentStatus } = useAthletePaymentStatus(user?.id, currentEventId);

    // Check if user is a monitor
    const { data: monitorModalities } = useMonitorModalities();
    const isMonitor = monitorModalities && monitorModalities.length > 0;

    console.log('📊 MobileDashboard rendering...', { user: !!user, currentEventId, isLoading });

    // DEBUG: Log when user exists
    useEffect(() => {
        if (user) {
            console.log('👤 User detected on Dashboard:', user.email);
        } else {
            console.log('👤 No user on Dashboard');
        }
    }, [user]);

    // Fetch user's enrolled active events (to auto-select or prompt)
    const { data: enrolledEvents = [], isLoading: loadingEnrolled } = useQuery({
        queryKey: ['dashboard-enrolled-events', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('inscricoes_eventos')
                .select('evento_id, eventos(*)')
                .eq('usuario_id', user.id);
            if (error) return [];
            return (data || [])
                .map((item: any) => item.eventos)
                .filter((ev: any) => ev?.status_evento === 'ativo');
        },
        enabled: !!user?.id,
    });

    // Smart auto-select: runs once enrolled events are loaded and no event is selected
    useEffect(() => {
        if (loadingEnrolled || currentEventId) return;

        if (enrolledEvents.length === 1) {
            // Auto-select the only enrolled event
            console.log('✅ Auto-selecting single enrolled event:', enrolledEvents[0].id);
            setCurrentEventId(enrolledEvents[0].id);
        } else if (enrolledEvents.length > 1) {
            // User has multiple enrolled events, open selector on "My Events" tab
            console.log('📋 Multiple enrolled events, opening selector...');
            setShowEventSelector(true);
        } else {
            // User has no enrolled events, open selector to enroll
            console.log('📋 No enrolled events, opening selector to enroll...');
            setShowEventSelector(true);
        }
    }, [enrolledEvents, loadingEnrolled, currentEventId, setCurrentEventId]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    // Determine payment status display with translations
    const getPaymentStatusDisplay = () => {
        if (!paymentStatus) return { text: t('payments.viewStatus'), color: 'text-blue-600' };

        const isExempt = paymentStatus.isento || paymentStatus.status_pagamento === 'isento';
        if (isExempt) {
            return { text: t('payments.exempt'), color: 'text-green-600' };
        }

        switch (paymentStatus.status_pagamento) {
            case 'confirmado':
            case 'aprovado':
                return { text: t('payments.paid'), color: 'text-green-600' };
            case 'pendente':
                return { text: t('payments.waiting'), color: 'text-yellow-600' };
            case 'rejeitado':
                return { text: t('payments.rejected'), color: 'text-red-600' };
            default:
                return { text: t('payments.viewStatus'), color: 'text-blue-600' };
        }
    };

    const paymentDisplay = getPaymentStatusDisplay();
    const isExempt = paymentStatus?.isento || paymentStatus?.status_pagamento === 'isento';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800" />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Event Header */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <button
                    onClick={() => setShowEventSelector(true)}
                    className="w-full text-left"
                >
                    <p className="text-sm text-gray-500 mb-1">{t('dashboard.currentEvent')}</p>
                    <h2 className="text-xl font-bold text-green-800">
                        {activeEvent?.nome || t('dashboard.selectEvent')}
                    </h2>
                    {activeEvent && (
                        <p className="text-sm text-gray-600 mt-1">
                            {activeEvent.cidade}, {activeEvent.estado}
                        </p>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                        {t('dashboard.tapToChange')}
                    </p>
                </button>
            </div>

            {/* Quick Stats - All cards are now clickable */}
            {currentEventId && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Monitor Area Card - Visible only to Monitors */}
                    {isMonitor && activeEvent?.has_attendance !== false && (
                        <button
                            onClick={() => navigate('/m/attendance')}
                            className="bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors active:scale-95 col-span-2 border-l-4 border-l-green-600"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <ClipboardCheck className="w-6 h-6 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('monitor.monitorArea')}</p>
                                    <p className="text-sm text-green-800 font-bold">{t('monitor.takeAttendance')}</p>
                                </div>
                            </div>
                        </button>
                    )}

                    {/* Enrollments Card */}
                    <button
                        onClick={() => navigate('/m/enrollments')}
                        className="bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-800" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('dashboard.enrollments')}</p>
                                <p className="text-xs text-green-600 font-medium">{t('dashboard.viewEnrollments')}</p>
                            </div>
                        </div>
                    </button>

                    {/* Payment Card */}
                    <button
                        onClick={() => navigate('/m/payment')}
                        className="bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${isExempt ? 'bg-green-100' : 'bg-blue-100'}`}>
                                {isExempt ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-800" />
                                ) : (
                                    <CreditCard className="w-6 h-6 text-blue-800" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('dashboard.payment')}</p>
                                <p className={`text-xs font-medium ${paymentDisplay.color}`}>
                                    {paymentDisplay.text}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Schedule/Upcoming Card */}
                    <button
                        onClick={() => navigate('/m/schedule')}
                        className="bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-800" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('dashboard.upcoming')}</p>
                                <p className="text-xs text-purple-600 font-medium">{t('dashboard.viewSchedule')}</p>
                            </div>
                        </div>
                    </button>

                    {/* Alerts/Notifications Card */}
                    <button
                        onClick={() => navigate('/m/notifications')}
                        className="bg-white rounded-lg p-4 shadow-sm text-left hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Bell className="w-6 h-6 text-orange-800" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('dashboard.alerts')}</p>
                                <p className="text-xs text-orange-600 font-medium">{t('dashboard.viewAlerts')}</p>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Welcome Message */}
            {!currentEventId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="font-bold text-lg mb-2">{t('dashboard.welcomeTitle')}</h3>
                    <p className="text-gray-600 mb-4">
                        {t('dashboard.welcomeMessage')}
                    </p>
                    <button
                        onClick={() => setShowEventSelector(true)}
                        className="px-6 py-2 bg-green-800 text-white rounded-lg font-medium"
                    >
                        {t('dashboard.selectEvent')}
                    </button>
                </div>
            )}

            {/* Event Selector */}
            <MobileEventSelector
                isOpen={showEventSelector}
                onClose={() => setShowEventSelector(false)}
            />
        </div>
    );
}

export default MobileDashboard;
