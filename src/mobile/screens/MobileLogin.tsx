import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LanguageSelector } from '../components/LanguageSelector';

/**
 * MobileLogin - Login screen for mobile app
 */
function MobileLogin() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    const [rememberEmail, setRememberEmail] = useState(false);
    const { user } = useAuth();

    // Auto-redirect to dashboard if already authenticated
    useEffect(() => {
        if (user) {
            console.log('🔄 User already authenticated, redirecting to dashboard...');
            navigate('/m/dashboard', { replace: true });
        }
    }, [user, navigate]);

    console.log('🔑 MobileLogin mounting...');

    // Load saved email on mount
    useState(() => {
        const saved = localStorage.getItem('olimpia-saved-email');
        if (saved) {
            setEmail(saved);
            setRememberEmail(true);
        }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(t('auth.invalidCredentials'));
            } else {
                // Save or clear email based on checkbox
                if (rememberEmail) {
                    localStorage.setItem('olimpia-saved-email', email);
                } else {
                    localStorage.removeItem('olimpia-saved-email');
                }
                navigate('/m/dashboard');
            }
        } catch (err) {
            setError(t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    // Helper to get current language name - uses i18n.language for reactivity
    const getCurrentLanguageName = () => {
        const langCode = i18n.language;
        switch (langCode) {
            case 'en-US': return 'English';
            case 'es-ES': return 'Español';
            default: return 'Português'; // Fallback / pt-BR
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-start p-6 pt-16 relative">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/lovable-uploads/fundo_tela_login_app.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Container (z-10 to sit above background) */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Logo/Header */}
                <div className="text-center mb-8 pt-8">
                    <div className="mb-6 flex justify-center">
                        <img
                            src="/lovable-uploads/app_icon_olimpia_manager.png"
                            alt="Logo"
                            className="h-24 w-auto object-contain rounded-xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mt-4">
                        Olímpia Manager
                    </h1>
                    <p className="text-gray-600 mt-1 font-medium">
                        {t('auth.loginSubtitle')}
                    </p>
                    <div className="mt-8 text-center text-xs text-gray-500">
                        <p>Olimpia.Manager © 2026</p>
                        <p>v1.0.14 (Build 14)</p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            placeholder={t('auth.emailPlaceholder')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.password')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder={t('auth.passwordPlaceholder')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember-email"
                            checked={rememberEmail}
                            onChange={(e) => setRememberEmail(e.target.checked)}
                            className="rounded text-green-700 focus:ring-green-500"
                        />
                        <label htmlFor="remember-email" className="text-sm text-gray-600">
                            Lembrar meu e-mail
                        </label>
                    </div>

                    <div className="text-right">
                        <Link
                            to="/m/forgot-password"
                            className="text-sm font-medium hover:underline py-2 inline-block text-green-800"
                        >
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50"
                        style={{ backgroundColor: '#1B5E20' }}
                    >
                        {loading ? t('common.loading') : t('auth.login')}
                    </button>

                    <div className="text-center mt-4 space-y-4">
                        <button
                            type="button"
                            onClick={() => navigate('/m/register')}
                            className="text-sm text-gray-600"
                        >
                            {t('auth.dontHaveAccount')} <strong className="text-green-800">{t('auth.register')}</strong>
                        </button>

                        {/* Language Selector (Text Button) */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="button"
                                onClick={() => setShowLanguageSelector(true)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-800 transition-colors px-4 py-2 rounded-full bg-gray-100"
                            >
                                <Globe size={16} />
                                <span>{getCurrentLanguageName()}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {/* End Content Container */}

            <LanguageSelector
                open={showLanguageSelector}
                onOpenChange={setShowLanguageSelector}
            />
        </div>
    );
}

export default MobileLogin;

