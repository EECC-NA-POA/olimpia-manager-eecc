import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running as a native mobile app (iOS or Android)
 */
export const isNativePlatform = (): boolean => {
    return Capacitor.isNativePlatform();
};

/**
 * Get the current platform: 'ios', 'android', or 'web'
 */
export const getPlatform = (): string => {
    return Capacitor.getPlatform();
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
    return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
    return Capacitor.getPlatform() === 'android';
};

/**
 * Check if running on web browser
 */
export const isWeb = (): boolean => {
    return Capacitor.getPlatform() === 'web';
};
