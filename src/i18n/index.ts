import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Import translation files
import ptBR from './locales/pt-BR.json';
import esES from './locales/es-ES.json';
import enUS from './locales/en-US.json';

// Supported languages
export const SUPPORTED_LANGUAGES = ['pt-BR', 'es-ES', 'en-US'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Default/fallback language (English for non-PT/ES/EN devices)
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en-US';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'olimpia-language';

/**
 * Maps device language codes to supported languages
 */
export const mapLanguageToSupported = (lang: string): SupportedLanguage => {
    const normalizedLang = lang.toLowerCase();

    // Portuguese variants -> pt-BR
    if (normalizedLang.startsWith('pt')) {
        return 'pt-BR';
    }

    // Spanish variants -> es-ES
    if (normalizedLang.startsWith('es')) {
        return 'es-ES';
    }

    // English variants -> en-US
    if (normalizedLang.startsWith('en')) {
        return 'en-US';
    }

    // Unsupported language → fall back to English
    return 'en-US';
};

/**
 * Detects the device language using Capacitor Device API
 */
export const detectDeviceLanguage = async (): Promise<SupportedLanguage> => {
    try {
        if (Capacitor.isNativePlatform()) {
            const { value } = await Device.getLanguageCode();
            return mapLanguageToSupported(value);
        }
    } catch (error) {
        console.warn('Failed to detect device language:', error);
    }

    // Fallback to browser language or default
    const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || DEFAULT_LANGUAGE;
    return mapLanguageToSupported(browserLang);
};

/**
 * Gets the stored language preference (uses Preferences on native, localStorage on web)
 */
export const getStoredLanguage = async (): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key: LANGUAGE_STORAGE_KEY });
        return value;
    }
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
};

/**
 * Stores the language preference (uses Preferences on native, localStorage on web)
 */
export const setStoredLanguage = async (lang: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: LANGUAGE_STORAGE_KEY, value: lang });
    }
    // Always set in localStorage too for the i18next detector
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};

// Translation resources
const resources = {
    'pt-BR': { translation: ptBR },
    'es-ES': { translation: esES },
    'en-US': { translation: enUS }
};

// Initialize i18next
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],

        // Language detection options
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ['localStorage']
        },

        interpolation: {
            escapeValue: false // React already escapes by default
        },

        // React-specific options
        react: {
            useSuspense: false
        }
    });

// Listen for language changes and persist them
i18n.on('languageChanged', (lng: string) => {
    setStoredLanguage(lng);
});

// Async initialization for native platforms
(async () => {
    if (Capacitor.isNativePlatform()) {
        const storedLang = await getStoredLanguage();

        if (storedLang) {
            // User has a saved preference — use it
            if (i18n.language !== storedLang) {
                i18n.changeLanguage(storedLang);
            }
        } else {
            // No stored preference — detect from device
            const deviceLang = await detectDeviceLanguage();
            i18n.changeLanguage(deviceLang);
        }
    }
})();

export default i18n;
