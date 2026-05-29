import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useAuth } from '@/contexts/AuthContext';
import MobileSettingsSheet from './MobileSettingsSheet';

/**
 * MobileHeader - Enhanced header for mobile app
 * 
 * Features:
 * - Settings menu button
 * - App title
 * - Notification button with badge (EVENT notifications - notificacoes table)
 * - Safe area support for notch devices
 */
function MobileHeader() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { user } = useAuth();
    const { activeEvent } = useActiveEvent();

    // Usar hook de EVENTOS para contagem do badge
    const { data: notifications = [] } = useNotifications({
        eventId: activeEvent?.id || '',
        userId: user?.id || '',
        includeAuthoredHidden: false
    });

    // Contar não lidas
    const unreadCount = notifications.filter(n => !n.lida).length;

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 shadow-sm"
                style={{
                    backgroundColor: '#1B5E20',
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
                    paddingBottom: '12px'
                }}
            >
                {/* Menu Button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={t('settings.title')}
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>

                {/* App Title */}
                <h1 className="text-lg font-semibold text-white">
                    Olímpia Manager
                </h1>

                {/* Notification Button with Badge */}
                <button
                    onClick={() => navigate('/m/notifications')}
                    className="relative p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={t('navigation.notifications')}
                >
                    <Bell className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                        <span
                            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full px-1"
                            style={{ backgroundColor: '#EF4444' }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Settings Sheet */}
            <MobileSettingsSheet
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}

export default MobileHeader;
