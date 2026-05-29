import { useTranslation } from 'react-i18next';
import { Trophy, RefreshCw, Medal } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useNavigate } from 'react-router-dom';
import { MobileScoreCard } from '../components/MobileScoreCard';

interface ScoreResult {
    id: number;
    modalityId: number;
    modalityName: string;
    category: string | null;
    position: number | null;
    points: number | null;
    date: string;
}

/**
 * MobileScores - Athlete scores and rankings
 */
function MobileScores() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, currentEventId } = useAuth();
    const { activeEvent } = useActiveEvent();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Redirect to home if the event has scores module disabled
    useEffect(() => {
        if (activeEvent && activeEvent.has_scores === false) {
            navigate('/m/home', { replace: true });
        }
    }, [activeEvent, navigate]);



    // Fetch athlete scores
    const {
        data: scores = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['mobile-scores', user?.id, currentEventId],
        queryFn: async (): Promise<ScoreResult[]> => {
            if (!user?.id || !currentEventId) return [];

            console.log('Fetching scores for:', user.id, currentEventId);

            const { data, error } = await supabase
                .from('pontuacoes')
                .select(`
                    id,
                    valor_pontuacao,
                    posicao_final,
                    data_registro,
                    modalidade_id,
                    modalidades!inner (
                        id,
                        nome,
                        categoria,
                        tipo_modalidade
                    )
                `)
                .eq('atleta_id', user.id)
                .eq('evento_id', currentEventId)
                .order('data_registro', { ascending: false });

            if (error) {
                console.error('Error fetching scores:', error);
                return [];
            }

            return (data || []).map((item: any) => ({
                id: item.id,
                modalityId: item.modalidade_id,
                modalityName: item.modalidades?.nome || t('schedule.modality'),
                category: item.modalidades?.categoria || null,
                position: item.posicao_final,
                points: item.valor_pontuacao,
                date: item.data_registro,
            }));
        },
        enabled: !!user?.id && !!currentEventId,
    });

    // Calculate summary
    const totalPoints = scores.reduce((sum, s) => sum + (s.points || 0), 0);
    const bestPosition = scores.length > 0
        ? Math.min(...scores.filter(s => s.position).map(s => s.position!))
        : null;

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
                    {t('scores.title')}
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-500">
                            {t('scores.totalPoints')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? '-' : totalPoints}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Medal className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-gray-500">
                            {t('scores.yourPosition')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? '-' : bestPosition ? `${bestPosition}º` : '-'}
                    </p>
                </div>
            </div>

            {/* Section Title */}
            <h2 className="text-lg font-semibold text-gray-900 pt-2">
                {t('scores.myScores')}
            </h2>

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : scores.length > 0 ? (
                <div className="space-y-3">
                    {scores.map((score) => (
                        <MobileScoreCard
                            key={score.id}
                            modalityName={score.modalityName}
                            category={score.category}
                            position={score.position}
                            points={score.points}
                            date={score.date}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                        {t('scores.noScores')}
                    </p>
                </div>
            )}
        </div>
    );
}

export default MobileScores;
