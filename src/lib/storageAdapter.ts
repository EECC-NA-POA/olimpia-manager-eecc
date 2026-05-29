import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Session management keys
const LAST_ACTIVITY_KEY = 'olimpia_last_activity';
const FIRST_LOGIN_KEY = 'olimpia_first_login';

// 30 days in milliseconds
const INACTIVITY_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;
// 3 months (90 days) in milliseconds
const MAX_SESSION_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Storage adapter that uses @capacitor/preferences on native platforms
 * and falls back to localStorage on web. This ensures session tokens
 * persist reliably on Android/iOS where localStorage can be wiped.
 */
export class CapacitorStorageAdapter {
    private isNative = Capacitor.isNativePlatform();

    async getItem(key: string): Promise<string | null> {
        if (this.isNative) {
            const { value } = await Preferences.get({ key });
            return value;
        }
        return localStorage.getItem(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        if (this.isNative) {
            await Preferences.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    }

    async removeItem(key: string): Promise<void> {
        if (this.isNative) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    }
}

// Singleton instance for session tracking
const storageAdapter = new CapacitorStorageAdapter();

/**
 * Records current timestamp as last activity
 */
export async function updateLastActivity(): Promise<void> {
    await storageAdapter.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Records current timestamp as first login (only if not already set)
 */
export async function setFirstLoginIfNeeded(): Promise<void> {
    const existing = await storageAdapter.getItem(FIRST_LOGIN_KEY);
    if (!existing) {
        await storageAdapter.setItem(FIRST_LOGIN_KEY, Date.now().toString());
    }
}

/**
 * Clears session activity timestamps (on logout)
 */
export async function clearSessionTimestamps(): Promise<void> {
    await storageAdapter.removeItem(LAST_ACTIVITY_KEY);
    await storageAdapter.removeItem(FIRST_LOGIN_KEY);
}

/**
 * Checks if the session has expired due to inactivity (>15 days)
 * or exceeded maximum age (>3 months)
 */
export async function isSessionExpiredByInactivity(): Promise<boolean> {
    const now = Date.now();

    // Check last activity
    const lastActivityStr = await storageAdapter.getItem(LAST_ACTIVITY_KEY);
    if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (now - lastActivity > INACTIVITY_LIMIT_MS) {
            console.log('⏰ Session expired: inactive for >30 days');
            return true;
        }
    }

    // Check max session age
    const firstLoginStr = await storageAdapter.getItem(FIRST_LOGIN_KEY);
    if (firstLoginStr) {
        const firstLogin = parseInt(firstLoginStr, 10);
        if (now - firstLogin > MAX_SESSION_AGE_MS) {
            console.log('⏰ Session expired: >3 months since first login');
            return true;
        }
    }

    return false;
}
