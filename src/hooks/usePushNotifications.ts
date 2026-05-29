// Hook for initializing and managing push notifications
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
    registerForPushNotifications,
    setupPushListeners,
    removeFcmToken,
    isPushNotificationsAvailable,
    PushNotifications,
} from '@/services/pushNotifications';

interface PushNotificationSchema {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
}

interface UsePushNotificationsOptions {
    /**
     * Whether to auto-register on mount when user is authenticated
     * @default true
     */
    autoRegister?: boolean;
    /**
     * Callback when a notification is received while app is in foreground
     */
    onNotificationReceived?: (notification: PushNotificationSchema) => void;
    /**
     * Callback when a notification is tapped
     */
    onNotificationTapped?: (notification: PushNotificationSchema) => void;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}) {
    const { autoRegister = true, onNotificationReceived, onNotificationTapped } = options;
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const cleanupRef = useRef<(() => Promise<void>) | null>(null);
    const isInitializedRef = useRef(false);

    // Handle notification received in foreground
    const handleNotificationReceived = useCallback(
        (notification: PushNotificationSchema) => {
            // Show in-app toast
            toast({
                title: notification.title || 'Nova notificação',
                description: notification.body,
            });

            // Call custom handler if provided
            onNotificationReceived?.(notification);
        },
        [toast, onNotificationReceived]
    );

    // Handle notification tap (navigate to relevant screen)
    const handleNotificationTapped = useCallback(
        (notification: PushNotificationSchema) => {
            const data = notification.data;

            // Navigate based on notification type
            if (data?.type === 'enrollment_confirmed' && data?.evento_id) {
                navigate(`/m/events/${data.evento_id}`);
            } else if (data?.type === 'game_reminder' && data?.evento_id) {
                navigate(`/m/events/${data.evento_id}`);
            } else if (data?.type === 'result_published' && data?.evento_id) {
                navigate(`/m/events/${data.evento_id}`);
            } else {
                // Default: go to notifications screen
                navigate('/m/notifications');
            }

            // Call custom handler if provided
            onNotificationTapped?.(notification);
        },
        [navigate, onNotificationTapped]
    );

    // Initialize push notifications
    const initializePush = useCallback(async () => {
        if (!user?.id || !isPushNotificationsAvailable()) {
            return;
        }

        if (isInitializedRef.current) {
            return;
        }

        try {
            console.log('Initializing push notifications for user:', user.id);

            // Setup listeners first
            cleanupRef.current = await setupPushListeners(
                user.id,
                handleNotificationReceived,
                handleNotificationTapped
            );

            // Register for push notifications (this will trigger the registration listener)
            await registerForPushNotifications(user.id);

            isInitializedRef.current = true;
            console.log('Push notifications initialized successfully');
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }, [user?.id, handleNotificationReceived, handleNotificationTapped]);

    // Cleanup on logout or unmount
    const cleanup = useCallback(async () => {
        if (cleanupRef.current) {
            await cleanupRef.current();
            cleanupRef.current = null;
        }

        if (user?.id) {
            await removeFcmToken(user.id);
        }

        isInitializedRef.current = false;
        console.log('Push notifications cleaned up');
    }, [user?.id]);

    // Auto-register when user is authenticated
    useEffect(() => {
        const initPushIfAllowed = async () => {
            if (autoRegister && user?.id && isPushNotificationsAvailable()) {
                if (PushNotifications) {
                    try {
                        let permStatus = await PushNotifications.checkPermissions();
                        if (permStatus.receive === 'prompt') {
                            console.log('🗣️ Pedindo permissão para Push Notifications...');
                            permStatus = await PushNotifications.requestPermissions();
                        }

                        if (permStatus.receive === 'granted') {
                            initializePush();
                        } else {
                            console.log('❌ Permissão de Push negada pelo usuário.');
                        }
                    } catch (e: any) {
                        console.error('Failed to check/request push permissions:', e);
                        // Fallback to initializing anyway (older Androids)
                        initializePush();
                    }
                } else {
                    console.error('Plugin PushNotifications é NULL ou Undefined!');
                }
            }
        };

        // Delay slighty to prevent StrictMode double-fire issues
        const timer = setTimeout(() => {
            initPushIfAllowed();
        }, 1000);

        // Cleanup when user logs out
        return () => {
            if (!user?.id && isInitializedRef.current) {
                cleanup();
            }
        };
    }, [user?.id, autoRegister, initializePush, cleanup]);

    return {
        /**
         * Whether push notifications are available on this device
         */
        isAvailable: isPushNotificationsAvailable(),

        /**
         * Whether push notifications are initialized
         */
        isInitialized: isInitializedRef.current,

        /**
         * Manually initialize push notifications
         */
        initialize: initializePush,

        /**
         * Cleanup push notification listeners and tokens
         */
        cleanup,
    };
}

export default usePushNotifications;
