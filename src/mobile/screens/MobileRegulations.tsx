import { useTranslation } from 'react-i18next';
import { FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeHtml } from '@/lib/security/htmlSanitizer';

interface Regulation {
    id: string;
    titulo: string;
    versao: string;
    regulamento_texto: string | null;
    regulamento_link: string | null;
    is_regulamento_texto: boolean;
    is_ativo: boolean;
}

/**
 * MobileRegulations - Event regulations viewer
 */
function MobileRegulations() {
    const { t } = useTranslation();
    const { currentEventId } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch active regulation
    const {
        data: regulation,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['mobile-regulation', currentEventId],
        queryFn: async (): Promise<Regulation | null> => {
            if (!currentEventId) return null;

            const { data, error } = await supabase
                .from('eventos_regulamentos')
                .select('*')
                .eq('evento_id', currentEventId)
                .eq('is_ativo', true)
                .order('criado_em', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching regulation:', error);
                return null;
            }

            return data as Regulation | null;
        },
        enabled: !!currentEventId,
    });

    // Open external link
    const openExternalLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">
                    {t('regulations.title')}
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            ) : regulation ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Title and Version */}
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {regulation.titulo}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('regulations.version')}: {regulation.versao}
                        </p>
                    </div>

                    {/* External Link Button */}
                    {regulation.regulamento_link && (
                        <div className="p-4 border-b border-gray-100">
                            <button
                                onClick={() => openExternalLink(regulation.regulamento_link!)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('regulations.openExternal')}
                            </button>
                        </div>
                    )}

                    {/* Text Content */}
                    {regulation.is_regulamento_texto !== false && regulation.regulamento_texto ? (
                        <div
                            className="p-4 prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(regulation.regulamento_texto),
                            }}
                        />
                    ) : regulation.is_regulamento_texto === false && !regulation.regulamento_link ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">
                                {t('regulations.noRegulation')}
                            </p>
                        </div>
                    ) : regulation.is_regulamento_texto === false && regulation.regulamento_link ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">
                                {t('regulations.useExternalLink')}
                            </p>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                        {t('regulations.noRegulation')}
                    </p>
                </div>
            )}
        </div>
    );
}

export default MobileRegulations;
