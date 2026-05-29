// Haptics Hook - Provides haptic feedback functions
// Uses Capacitor Haptics API

import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Dynamically import Haptics plugin only on native platforms
let Haptics: any = null;

async function loadHapticsPlugin() {
    if (!Capacitor.isNativePlatform()) {
        return null;
    }

    try {
        const module = await import('@capacitor/haptics');
        return module.Haptics;
    } catch (error) {
        console.error('Failed to load Haptics plugin:', error);
        return null;
    }
}

export function useHaptics() {
    /**
     * Trigger impact haptic feedback
     * @param style - 'light', 'medium', or 'heavy'
     */
    const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
        const HapticsPlugin = await loadHapticsPlugin();
        if (!HapticsPlugin) return;

        try {
            const { ImpactStyle } = await import('@capacitor/haptics');

            const styleMap = {
                light: ImpactStyle.Light,
                medium: ImpactStyle.Medium,
                heavy: ImpactStyle.Heavy,
            };

            await HapticsPlugin.impact({ style: styleMap[style] });
        } catch (error) {
            console.error('Error triggering impact haptic:', error);
        }
    }, []);

    /**
     * Trigger success notification haptic
     * Used for: successful actions, confirmation, completion
     */
    const success = useCallback(async () => {
        const HapticsPlugin = await loadHapticsPlugin();
        if (!HapticsPlugin) return;

        try {
            const { NotificationType } = await import('@capacitor/haptics');
            await HapticsPlugin.notification({ type: NotificationType.Success });
        } catch (error) {
            console.error('Error triggering success haptic:', error);
        }
    }, []);

    /**
     * Trigger error notification haptic
     * Used for: errors, failures, invalid actions
     */
    const error = useCallback(async () => {
        const HapticsPlugin = await loadHapticsPlugin();
        if (!HapticsPlugin) return;

        try {
            const { NotificationType } = await import('@capacitor/haptics');
            await HapticsPlugin.notification({ type: NotificationType.Error });
        } catch (error) {
            console.error('Error triggering error haptic:', error);
        }
    }, []);

    /**
     * Trigger warning notification haptic
     * Used for: warnings, alerts, caution messages
     */
    const warning = useCallback(async () => {
        const HapticsPlugin = await loadHapticsPlugin();
        if (!HapticsPlugin) return;

        try {
            const { NotificationType } = await import('@capacitor/haptics');
            await HapticsPlugin.notification({ type: NotificationType.Warning });
        } catch (error) {
            console.error('Error triggering warning haptic:', error);
        }
    }, []);

    /**
     * Trigger a simple vibration (fallback for older devices)
     * @param duration - Duration in milliseconds (default: 200ms)
     */
    const vibrate = useCallback(async (duration: number = 200) => {
        const HapticsPlugin = await loadHapticsPlugin();
        if (!HapticsPlugin) return;

        try {
            await HapticsPlugin.vibrate({ duration });
        } catch (error) {
            console.error('Error triggering vibration:', error);
        }
    }, []);

    /**
     * Check if haptics are available on this device
     */
    const isAvailable = useCallback(() => {
        return Capacitor.isNativePlatform();
    }, []);

    return {
        impact,
        success,
        error,
        warning,
        vibrate,
        isAvailable,
    };
}

export default useHaptics;
