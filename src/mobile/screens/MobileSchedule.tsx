import { useTranslation } from 'react-i18next';
import { Calendar, RefreshCw } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { MobileActivityCard } from '../components/MobileActivityCard';
import { ScheduleActivity } from '@/components/cronograma/types';
import { expandRecurrentActivity } from '@/components/cronograma/utils';



/**
 * MobileSchedule - Event schedule/timeline with day filter
 */
function MobileSchedule() {
    const { t, i18n } = useTranslation();
    const { user, currentEventId } = useAuth();
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch schedule activities using secure RPC (bypasses view RLS issues)
    const {
        data: activities = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['mobile-schedule', user?.id, currentEventId],
        queryFn: async (): Promise<ScheduleActivity[]> => {
            if (!user?.id || !currentEventId) {
                return [];
            }

            console.log('🔄 MobileSchedule: Fetching for', { userId: user.id, eventId: currentEventId });

            // Use secure RPC function that bypasses RLS
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_schedule', {
                p_evento_id: currentEventId,
                p_atleta_id: user.id,
            });

            let rawActivities: any[] = [];

            if (rpcError) {
                console.error('❌ Error fetching schedule via RPC:', rpcError);
                // Fallback: try direct table query for global activities only
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('cronograma_atividades')
                    .select('*') // Need all fields for recurrence
                    .eq('evento_id', currentEventId)
                    .eq('global', true)
                    .order('dia')
                    .order('horario_inicio');

                if (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                    return [];
                }
                rawActivities = fallbackData || [];
            } else {
                rawActivities = rpcData || [];
            }

            // Transform details to match ScheduleActivity interface
            const baseActivities: ScheduleActivity[] = rawActivities.map((item: any) => ({
                id: item.cronograma_atividade_id || item.id,
                cronograma_atividade_id: item.cronograma_atividade_id || item.id,
                atividade: item.atividade,
                dia: item.dia,
                horario_inicio: item.horario_inicio,
                horario_fim: item.horario_fim,
                local: item.local,
                global: item.global,
                modalidade_nome: item.modalidade_nome,
                modalidade_status: item.modalidade_status,
                atleta_id: item.atleta_id,
                recorrente: item.recorrente,
                dias_semana: item.dias_semana,
                horarios_por_dia: item.horarios_por_dia,
                locais_por_dia: item.locais_por_dia,
                data_fim_recorrencia: item.data_fim_recorrencia
            }));

            // Expand recurrent activities
            const expandedActivities: ScheduleActivity[] = [];
            baseActivities.forEach(activity => {
                const expanded = expandRecurrentActivity(activity);
                expandedActivities.push(...expanded);
            });

            // Filter out items that still have null day (shouldn't happen after expansion unless misconfigured)
            const validItems = expandedActivities.filter(t => t.dia !== null && t.dia !== undefined);

            // Deduplicate by id+dia
            const seen = new Set<string>();
            const unique = validItems.filter((item) => {
                const key = `${item.cronograma_atividade_id}-${item.dia}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Sort logic: Days of week first, then dates
            const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

            unique.sort((a, b) => {
                const diaA = a.dia || '';
                const diaB = b.dia || '';

                // If both are days of week
                const idxA = dayOrder.indexOf(diaA.toLowerCase());
                const idxB = dayOrder.indexOf(diaB.toLowerCase());

                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1; // Days come before dates
                if (idxB !== -1) return 1;

                // Both are dates
                if (diaA !== diaB) return diaA.localeCompare(diaB);
                return (a.horario_inicio || '').localeCompare(b.horario_inicio || '');
            });

            console.log('✅ MobileSchedule: Final Items after expansion:', unique.length);
            return unique;
        },
        enabled: !!user?.id && !!currentEventId,
    });

    // Get unique days for filter
    const availableDays = useMemo(() => {
        const days = new Set(activities.map(a => a.dia).filter(Boolean) as string[]);

        const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo', 'sábado', 'terça'];
        return Array.from(days).sort((a, b) => {
            // Sort logic matching the main list
            const idxA = dayOrder.indexOf(a.toLowerCase().replace('ç', 'c').replace('á', 'a'));
            const idxB = dayOrder.indexOf(b.toLowerCase().replace('ç', 'c').replace('á', 'a'));

            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [activities]);

    // Filter activities by selected day
    const filteredActivities = useMemo(() => {
        if (selectedDay === 'all') return activities;
        return activities.filter(a => a.dia === selectedDay);
    }, [activities, selectedDay]);

    // Format day for display using current locale
    const formatDay = (dayKey: string) => {
        const normalized = dayKey.toLowerCase().replace('ç', 'c').replace('á', 'a');

        // Look up from translations (schedule.days.segunda, etc.)
        const translatedDay = t(`schedule.days.${normalized}`, { defaultValue: '' });
        if (translatedDay) {
            return translatedDay;
        }

        // It's a date
        try {
            const date = new Date(dayKey + 'T00:00:00');
            const locale = i18n.language === 'pt-BR' ? 'pt-BR' :
                i18n.language === 'es-ES' ? 'es-ES' : 'en-US';
            return date.toLocaleDateString(locale, {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
            });
        } catch {
            return dayKey;
        }
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
                    {t('schedule.title')}
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>



            {/* Day Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                <button
                    onClick={() => setSelectedDay('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === 'all'
                        ? 'text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                    style={selectedDay === 'all' ? { backgroundColor: '#1B5E20' } : undefined}
                >
                    {t('schedule.allDays')}
                </button>
                {availableDays.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day
                            ? 'text-white'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            }`}
                        style={selectedDay === day ? { backgroundColor: '#1B5E20' } : undefined}
                    >
                        {formatDay(day)}
                    </button>
                ))}
            </div>

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
            ) : !currentEventId ? (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-medium mb-2">
                        {t('dashboard.selectEvent')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('schedule.selectEventFirst')}
                    </p>
                </div>
            ) : filteredActivities.length > 0 ? (
                <div className="space-y-3">
                    {filteredActivities.map((activity, index) => (
                        <MobileActivityCard
                            key={`${activity.cronograma_atividade_id}-${activity.dia}-${index}`}
                            id={activity.cronograma_atividade_id || 0}
                            name={activity.atividade}
                            time={activity.horario_inicio?.slice(0, 5) || ''}
                            endTime={activity.horario_fim?.slice(0, 5)}
                            location={activity.local}
                            modalityName={activity.modalidade_nome}
                            isGlobal={activity.global}
                            userParticipates={activity.atleta_id === user?.id}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">
                        {t('schedule.noEvents')}
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 text-green-700 font-medium text-sm"
                    >
                        {t('common.tryAgain')}
                    </button>
                </div>
            )}
        </div>
    );
}

export default MobileSchedule;
