import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * MobileForgotPassword - Mobile-optimized forgot password screen
 */
export default function MobileForgotPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error(t('auth.invalidCredentials'));
            return;
        }

        try {
            setLoading(true);
            console.log('Requesting password reset for:', email);

            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            // Show success message (same message regardless of email existence for security)
            toast.success(t('auth.emailSent'));

            setEmail('');
            // Navigate back to login after a short delay
            setTimeout(() => {
                navigate('/m/login');
            }, 2000);

        } catch (error) {
            console.error('Error in password reset request:', error);
            // Show the same message even on error to maintain security
            toast.success(t('auth.emailSent'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            {/* Header */}
            <div className="bg-green-800 text-white p-4 flex items-center gap-3">
                <button
                    onClick={() => navigate('/m/login')}
                    className="p-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{t('auth.resetPassword')}</h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-md mx-auto px-6 pt-6">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-100 rounded-full">
                        <Mail className="w-12 h-12 text-green-800" />
                    </div>
                </div>

                {/* Title and Description */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    {t('auth.forgotPassword')}
                </h2>
                <p className="text-gray-600 text-center mb-8">
                    {t('auth.resetDescription')}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            placeholder={t('auth.emailPlaceholder')}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#1B5E20' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('common.loading')}
                            </>
                        ) : (
                            t('auth.sendResetEmail')
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/m/login')}
                        className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t('common.back')}
                    </button>
                </form>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    {t('auth.checkSpam')}
                </p>
            </div>
        </div>
    );
}
