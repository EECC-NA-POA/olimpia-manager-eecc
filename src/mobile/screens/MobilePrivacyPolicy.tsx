import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { fetchActivePrivacyPolicy } from '@/lib/api/privacyPolicy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function MobilePrivacyPolicy() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [policyContent, setPolicyContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        loadPolicy();
    }, []);

    const loadPolicy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const content = await fetchActivePrivacyPolicy(i18n.language);
            // Fix newlines: Replace single newlines with double newlines
            const formattedContent = content ? content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2') : '';
            setPolicyContent(formattedContent);
        } catch (err) {
            console.error('Error loading privacy policy:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 -ml-1 text-gray-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-gray-900 leading-tight">
                    {t('register.privacyTitle')}
                </h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-4">{t('common.error')}</p>
                        <button
                            onClick={loadPolicy}
                            className="px-4 py-2 bg-green-800 text-white rounded-lg"
                        >
                            {t('common.tryAgain')}
                        </button>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-gray-700 pb-8">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {policyContent || ''}
                        </ReactMarkdown>
                    </div>
                )}
            </main>
        </div>
    );
}
