// Push Notifications Service
// Handles FCM token registration, listeners, and permission management

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';
import { PushNotifications as CapacitorPushNotificationsPlugin } from '@capacitor/push-notifications';

// Define types for the push notifications plugin
interface PushNotificationToken {
    value: string;
}

interface PushNotificationSchema {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
}

interface ActionPerformed {
    notification: PushNotificationSchema;
    actionId: string;
}

interface PushNotificationsPlugin {
    checkPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
    requestPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
    register(): Promise<void>;
    addListener(
        event: 'registration',
        callback: (token: PushNotificationToken) => void
    ): Promise<{ remove: () => void }>;
    addListener(
        event: 'registrationError',
        callback: (error: { error: string }) => void
    ): Promise<{ remove: () => void }>;
    addListener(
        event: 'pushNotificationReceived',
        callback: (notification: PushNotificationSchema) => void
    ): Promise<{ remove: () => void }>;
    addListener(
        event: 'pushNotificationActionPerformed',
        callback: (action: ActionPerformed) => void
    ): Promise<{ remove: () => void }>;
    removeAllListeners(): Promise<void>;
}

// Expose the static plugin directly
export const PushNotifications = CapacitorPushNotificationsPlugin as PushNotificationsPlugin;

/**
 * Get the current platform (ios, android, or web)
 */
function getPlatform(): 'ios' | 'android' | 'web' {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || !PushNotifications) return false;

    try {
        const result = await PushNotifications.requestPermissions();
        console.log('Push notification permission:', result.receive);
        return result.receive === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

/**
 * Register the device for push notifications and save the token
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || !PushNotifications) return;

    try {
        // Request permission first
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.log('Push notification permission denied');
            return;
        }

        // Register for push notifications
        await PushNotifications.register();
        console.log('Push notifications registered');
    } catch (error) {
        console.error('Error registering for push notifications:', error);
    }
}

/**
 * Save FCM token to Supabase
 */
export async function saveFcmToken(
    userId: string,
    token: string,
    deviceInfo?: Record<string, unknown>
): Promise<void> {
    const platform = getPlatform();

    try {
        // Upsert the token (insert or update if exists)
        const { error } = await supabase
            .from('push_tokens')
            .upsert(
                {
                    user_id: userId,
                    fcm_token: token,
                    platform,
                    device_info: deviceInfo || {},
                    is_active: true,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id,fcm_token',
                }
            );

        if (error) {
            console.error('Error saving FCM token:', error);
            throw error;
        }

        console.log('FCM token saved successfully');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

/**
 * Remove FCM token from Supabase (on logout)
 */
export async function removeFcmToken(userId: string, token?: string): Promise<void> {
    try {
        if (token) {
            // Remove specific token
            await supabase
                .from('push_tokens')
                .update({ is_active: false })
                .eq('user_id', userId)
                .eq('fcm_token', token);
        } else {
            // Deactivate all tokens for this user
            await supabase
                .from('push_tokens')
                .update({ is_active: false })
                .eq('user_id', userId);
        }

        console.log('FCM token(s) deactivated');
    } catch (error) {
        console.error('Error removing FCM token:', error);
    }
}

/**
 * Setup push notification listeners
 * Returns a cleanup function to remove listeners
 */
export async function setupPushListeners(
    userId: string,
    onNotificationReceived?: (notification: PushNotificationSchema) => void,
    onNotificationTapped?: (notification: PushNotificationSchema) => void
): Promise<() => Promise<void>> {
    if (!Capacitor.isNativePlatform() || !PushNotifications) {
        return async () => { };
    }

    const listeners: Array<{ remove: () => void }> = [];

    try {
        // On registration success - save token
        const registrationListener = await PushNotifications.addListener(
            'registration',
            async (token: PushNotificationToken) => {
                console.log('Push registration success, token:', token.value.substring(0, 20) + '...');
                await saveFcmToken(userId, token.value);
            }
        );
        listeners.push(registrationListener);

        // On registration error
        const errorListener = await PushNotifications.addListener(
            'registrationError',
            (error: { error: string }) => {
                console.error('Push registration error:', error.error);
            }
        );
        listeners.push(errorListener);

        // Notification received while app is in foreground
        const receivedListener = await PushNotifications.addListener(
            'pushNotificationReceived',
            (notification: PushNotificationSchema) => {
                console.log('Push notification received:', notification);
                onNotificationReceived?.(notification);
            }
        );
        listeners.push(receivedListener);

        // Notification was tapped (app in background or killed)
        const actionListener = await PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (action: ActionPerformed) => {
                console.log('Push notification action:', action);
                onNotificationTapped?.(action.notification);
            }
        );
        listeners.push(actionListener);

        console.log('Push listeners setup complete');
    } catch (error) {
        console.error('Error setting up push listeners:', error);
    }

    // Return cleanup function
    return async () => {
        for (const listener of listeners) {
            listener.remove();
        }
        console.log('Push listeners removed');
    };
}

/**
 * Check if push notifications are available on this device
 */
export function isPushNotificationsAvailable(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Send a test notification (for development purposes)
 * This would typically be done server-side
 */
export async function sendTestNotification(userId: string): Promise<void> {
    try {
        const { error } = await supabase.functions.invoke('send-push', {
            body: {
                user_id: userId,
                title: 'Test Notification',
                body: 'This is a test push notification!',
                data: { type: 'test' },
            },
        });

        if (error) throw error;
        console.log('Test notification sent');
    } catch (error) {
        console.error('Error sending test notification:', error);
    }
}
