import { ReactNode } from 'react';
import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';

interface MobileLayoutProps {
    children: ReactNode;
}

/**
 * MobileLayout - Main layout wrapper for mobile screens
 * 
 * Structure:
 * - Fixed header at top (with safe-area)
 * - Scrollable content area
 * - Fixed bottom tab bar (with safe-area)
 */
function MobileLayout({ children }: MobileLayoutProps) {
    // TODO: Replace with actual notification count from useNotifications hook
    const unreadNotifications = 0;

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: '#FAFAFA' }}
        >
            {/* Fixed Header */}
            <MobileHeader unreadNotifications={unreadNotifications} />

            {/* Scrollable Content Area */}
            <main
                className="flex-1 overflow-y-auto"
                style={{
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)', // Header height + safe area
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' // Tab bar height + safe area
                }}
            >
                <div className="p-4">
                    {children}
                </div>
            </main>

            {/* Fixed Bottom Tab Bar */}
            <BottomTabBar unreadNotifications={unreadNotifications} />
        </div>
    );
}

export default MobileLayout;
