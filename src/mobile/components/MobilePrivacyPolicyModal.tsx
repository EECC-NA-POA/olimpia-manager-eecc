/**
 * MobilePrivacyPolicyModal
 * 
 * Modal mobile para exibição da política de privacidade
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchActivePrivacyPolicy } from '@/lib/api/privacyPolicy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

interface MobilePrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function MobilePrivacyPolicyModal({ isOpen, onClose }: MobilePrivacyPolicyModalProps) {
    const { t, i18n } = useTranslation();
    const [policyContent, setPolicyContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        if (isOpen) {
            loadPolicy();
        }
    }, [isOpen]);

    const loadPolicy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const content = await fetchActivePrivacyPolicy(i18n.language);
            // Fix newlines: Replace single newlines with double newlines to force paragraphs in Markdown
            // or replace \n with "  \n" to force line breaks.
            // Let's use a robust regex to double newlines if they are single.
            const formattedContent = content ? content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2') : '';
            setPolicyContent(formattedContent);
        } catch (err) {
            console.error('Error loading privacy policy:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">{t('register.privacyTitle')}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
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
                            <div className="prose prose-sm max-w-none text-gray-700">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {policyContent || ''}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-green-800 text-white rounded-lg font-medium"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MobilePrivacyPolicyModal;
