import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    User,
    ChevronRight,
    Globe,
    Bell,
    FileText,
    Info,
    LogOut,
    ExternalLink
} from 'lucide-react';
// TODO: Install @capacitor/browser first: npm install @capacitor/browser --legacy-peer-deps
// import { Browser } from '@capacitor/browser';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Language config for display
const LANGUAGES: Record<string, { name: string; flag: string }> = {
    'pt-BR': { name: 'Português', flag: '🇧🇷' },
    'es-ES': { name: 'Español', flag: '🇪🇸' },
    'en-US': { name: 'English', flag: '🇺🇸' },
};

/**
 * MobileProfile - User profile and settings
 */
function MobileProfile() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Fetch user's branch
    const { data: branch } = useQuery({
        queryKey: ['user-branch', user?.filial_id],
        queryFn: async () => {
            if (!user?.filial_id) return null;
            const { data, error } = await supabase
                .from('filiais')
                .select('id, nome, cidade, estado')
                .eq('id', user.filial_id)
                .single();

            if (error) {
                console.error('Error fetching branch:', error);
                return null;
            }
            return data;
        },
        enabled: !!user?.filial_id,
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/m/login');
    };

    // TODO: Uncomment after installing @capacitor/browser
    // const handleOpenWebsite = async () => {
    //     try {
    //         // Get current session
    //         const { data: { session } } = await supabase.auth.getSession();
    //         
    //         const baseUrl = 'https://olimpia.nova-acropole.org.br/login';
    //         
    //         // If user is logged in, pass access token to auto-login on web
    //         const url = session?.access_token 
    //             ? `${baseUrl}?token=${session.access_token}`
    //             : baseUrl;
    //         
    //         await Browser.open({ url });
    //     } catch (error) {
    //         console.error('Error opening website:', error);
    //         // Fallback: open without token
    //         await Browser.open({ url: 'https://olimpia.nova-acropole.org.br/login' });
    //     }
    // };

    // Temporary fallback: open in new tab
    const handleOpenWebsite = () => {
        window.open('https://olimpia.nova-acropole.org.br/login', '_blank');
    };

    const currentLang = LANGUAGES[i18n.language] || LANGUAGES['pt-BR'];

    const settingsItems = [
        {
            icon: Globe,
            label: t('profile.language'),
            value: (
                <span className="flex items-center gap-1 text-gray-500">
                    {currentLang.flag} {currentLang.name}
                </span>
            ),
            action: () => setShowLanguageSelector(true),
        },
        {
            icon: Bell,
            label: t('profile.notifications'),
            path: '/m/notifications',
        },
        {
            icon: FileText,
            label: t('profile.regulations'),
            path: '/m/regulations',
        },
        {
            icon: Info,
            label: t('profile.about'),
            path: '/m/about',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: '#1B5E2020' }}
                >
                    <User className="w-10 h-10" style={{ color: '#1B5E20' }} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                    {user?.nome_completo || t('profile.title')}
                </h2>
                {user?.email && (
                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                )}
                {branch && (
                    <p className="text-sm text-gray-500 mt-1">
                        {branch.nome} • {branch.cidade}/{branch.estado}
                    </p>
                )}
            </div>

            {/* Settings Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                    {t('profile.settings')}
                </h3>
                {settingsItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => item.action ? item.action() : item.path && navigate(item.path)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index < settingsItems.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-900">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.value}
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Web Access Button */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2">
                    {t('profile.fullAccess')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    {t('profile.fullAccessDesc')}
                </p>
                <button
                    onClick={handleOpenWebsite}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-800 text-white rounded-lg font-medium hover:bg-green-900 transition-colors"
                >
                    <ExternalLink className="w-5 h-5" />
                    {t('profile.openWeb')}
                </button>
            </div>

            {/* Logout Button */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl text-red-600 font-medium hover:bg-red-100 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                {t('profile.logout')}
            </button>

            {/* Version */}
            <p className="text-center text-xs text-gray-400">
                {t('profile.version')}: 1.0.0
            </p>

            {/* Language Selector Modal */}
            <LanguageSelector
                open={showLanguageSelector}
                onOpenChange={setShowLanguageSelector}
            />

            {/* Logout Confirmation */}
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('profile.logout')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('profile.logoutConfirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('profile.logout')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default MobileProfile;
