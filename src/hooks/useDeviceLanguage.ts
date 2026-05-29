import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    mapLanguageToSupported,
    type SupportedLanguage
} from '@/i18n';

/**
 * Hook for managing device language detection and language switching
 * 
 * Features:
 * - Detects device language on native platforms via Capacitor Device API
 * - Falls back to browser language on web
 * - Provides method to change language manually
 * - Persists language preference to localStorage
 */
export const useDeviceLanguage = () => {
    const { i18n } = useTranslation();
    const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Detect device language on mount
    useEffect(() => {
        const detectLanguage = async () => {
            try {
                let deviceLang: string;

                if (Capacitor.isNativePlatform()) {
                    // Use Capacitor Device API for native platforms
                    const { value } = await Device.getLanguageCode();
                    deviceLang = value;
                } else {
                    // Use browser language for web
                    deviceLang = navigator.language ||
                        (navigator as { userLanguage?: string }).userLanguage ||
                        DEFAULT_LANGUAGE;
                }

                const mappedLanguage = mapLanguageToSupported(deviceLang);
                setDetectedLanguage(mappedLanguage);
            } catch (error) {
                console.warn('Failed to detect device language:', error);
                setDetectedLanguage(DEFAULT_LANGUAGE);
            } finally {
                setIsLoading(false);
            }
        };

        detectLanguage();
    }, []);

    // Change language and persist to storage
    const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
        try {
            await i18n.changeLanguage(lang);
            localStorage.setItem('olimpia-language', lang);
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    }, [i18n]);

    // Get current language
    const currentLanguage = i18n.language as SupportedLanguage;

    return {
        /** Currently active language */
        currentLanguage,
        /** Language detected from device (before any user override) */
        detectedLanguage,
        /** Whether language detection is still in progress */
        isLoading,
        /** Change the active language */
        changeLanguage,
        /** List of supported languages */
        supportedLanguages: SUPPORTED_LANGUAGES,
        /** Check if running on native platform */
        isNative: Capacitor.isNativePlatform()
    };
};

export default useDeviceLanguage;
