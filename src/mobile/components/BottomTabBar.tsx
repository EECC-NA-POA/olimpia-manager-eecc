import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, Trophy, ClipboardList, User } from 'lucide-react';
import { useActiveEvent } from '@/hooks/useActiveEvent';

interface TabItem {
    path: string;
    icon: typeof Home;
    labelKey: string;
    showBadge?: boolean;
    requiresScoreModule?: boolean;
}

// Tabs in the requested order: Home, Enrollments, Schedule, Scores, Profile
const baseTabs: TabItem[] = [
    { path: '/m/dashboard', icon: Home, labelKey: 'navigation.home', showBadge: true },
    { path: '/m/enrollments', icon: ClipboardList, labelKey: 'navigation.enrollments' },
    { path: '/m/schedule', icon: Calendar, labelKey: 'navigation.schedule' },
    { path: '/m/scores', icon: Trophy, labelKey: 'navigation.scores', requiresScoreModule: true },
    { path: '/m/profile', icon: User, labelKey: 'navigation.profile' },
];

interface BottomTabBarProps {
    unreadNotifications?: number;
}

/**
 * BottomTabBar - Bottom navigation for mobile app
 * 
 * Features:
 * - 5 main tabs with icons and labels
 * - Active tab highlighting
 * - Notification badge on Home tab
 * - Safe area padding for iPhone home indicator
 */
function BottomTabBar({ unreadNotifications = 0 }: BottomTabBarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { activeEvent } = useActiveEvent();

    // Filter tabs based on active event features
    const tabs = baseTabs.filter(tab => {
        if (tab.requiresScoreModule && activeEvent?.has_scores === false) {
            return false;
        }
        return true;
    });

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                backgroundColor: '#FFFFFF'
            }}
        >
            <div className="flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);
                    const showDot = tab.showBadge && unreadNotifications > 0;

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className="relative flex flex-col items-center justify-center flex-1 h-full transition-colors"
                            style={{ color: active ? '#1B5E20' : '#9E9E9E' }}
                            aria-label={t(tab.labelKey)}
                            aria-current={active ? 'page' : undefined}
                        >
                            <div className="relative">
                                <Icon
                                    className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                                />
                                {/* Badge dot */}
                                {showDot && (
                                    <span
                                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: '#EF4444' }}
                                    />
                                )}
                            </div>
                            <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
                                {t(tab.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default BottomTabBar;
