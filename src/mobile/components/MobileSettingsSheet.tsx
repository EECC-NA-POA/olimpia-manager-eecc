import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    X,
    Globe,
    Moon,
    Sun,
    FileText,
    LogOut,
    ChevronRight,
    Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

interface MobileSettingsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * MobileSettingsSheet - Side sheet with quick settings
 * 
 * Features:
 * - Language switcher
 * - Theme toggle (placeholder)
 * - Quick links
 * - Logout
 */
function MobileSettingsSheet({ isOpen, onClose }: MobileSettingsSheetProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onClose();
        navigate('/m/login');
    };

    const handleLanguageChange = (lang: SupportedLanguage) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('olimpia-language', lang);
    };

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white shadow-xl"
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ backgroundColor: '#1B5E20' }}
                >
                    <h2 className="text-lg font-semibold text-white">
                        {t('settings.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col h-[calc(100%-64px)]">
                    {/* Language Section */}
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500">
                            <Globe className="w-4 h-4" />
                            {t('settings.language')}
                        </div>
                        <div className="space-y-1">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${i18n.language === lang
                                            ? 'bg-green-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    style={i18n.language === lang ? { color: '#1B5E20' } : undefined}
                                >
                                    <span>{t(`languages.${lang}`)}</span>
                                    {i18n.language === lang && (
                                        <Check className="w-5 h-5" style={{ color: '#1B5E20' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex-1 p-4">
                        <button
                            onClick={() => handleNavigate('/m/regulations')}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <span>{t('navigation.regulations')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-4 border-t" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('auth.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MobileSettingsSheet;
