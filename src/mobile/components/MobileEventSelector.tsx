/**
 * MobileEventSelector Component
 *
 * Bottom sheet para seleção de eventos no mobile
 * Tabs: Meus Eventos | Disponíveis
 * Inclui opção de inscrição em eventos disponíveis
 * Mostra perfil de inscrição para eventos já inscritos
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X, Calendar, MapPin, Users, UserCheck, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useHaptics } from '@/hooks/useHaptics';
import { useEventRegistration } from '@/components/auth/event-selection/useEventRegistration';
import { PerfilTipo } from '@/lib/types/database';
import { toast } from 'sonner';

interface MobileEventSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Event {
    id: string;
    nome: string;
    descricao: string;
    tipo: string;
    cidade: string;
    estado: string;
    foto_evento: string | null;
    data_inicio_evento: string;
    data_fim_evento: string;
    status_evento: string;
}

interface EnrolledEvent extends Event {
    perfil_tipo?: string; // ATL, PGR, etc.
}

function MobileEventSelector({ isOpen, onClose }: MobileEventSelectorProps) {
    const { t, i18n } = useTranslation();
    const { user, setCurrentEventId, currentEventId } = useAuth();
    const haptics = useHaptics();
    const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
    const [eventToEnroll, setEventToEnroll] = useState<Event | null>(null);
    const [selectedRole, setSelectedRole] = useState<PerfilTipo | null>(null);

    // Hook de inscrição em evento
    const eventRegistration = useEventRegistration(user?.id);

    // Buscar eventos em que o usuário está inscrito (with role info)
    const { data: enrolledEvents = [], isLoading: loadingEnrolled, refetch: refetchEnrolled } = useQuery({
        queryKey: ['user-enrolled-events', user?.id],
        queryFn: async (): Promise<EnrolledEvent[]> => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from('inscricoes_eventos')
                .select(`
                    evento_id,
                    selected_role,
                    eventos (*)
                `)
                .eq('usuario_id', user.id);

            if (error) {
                console.error('Error fetching enrolled events:', error);
                throw error;
            }

            return data
                ?.map((item: any) => ({
                    ...item.eventos,
                    perfil_tipo: item.selected_role?.toString() // map selected_role to perfil_tipo for display
                }))
                .filter((event: any) => event?.status_evento === 'ativo') || [];
        },
        enabled: !!user?.id && isOpen,
    });

    // Buscar eventos disponíveis (onde a filial do usuário está habilitada)
    const { data: availableEvents = [], isLoading: loadingAvailable, refetch: refetchAvailable } = useQuery({
        queryKey: ['available-events', user?.id, enrolledEvents.map((e: EnrolledEvent) => e.id).join(',')],
        queryFn: async () => {
            if (!user?.id) return [];

            // Buscar filial do usuário
            const { data: userData } = await supabase
                .from('usuarios')
                .select('filial_id')
                .eq('id', user.id)
                .single();

            if (!userData?.filial_id) return [];

            // Buscar eventos onde a filial está habilitada
            const { data, error } = await supabase
                .from('eventos_filiais')
                .select(`
                    evento_id,
                    eventos (*)
                `)
                .eq('filial_id', userData.filial_id);

            if (error) throw error;

            // Filtrar apenas ativos e onde usuário NÍO está inscrito
            const enrolledIds = enrolledEvents.map((e: any) => e.id);
            return data
                ?.map((item: any) => item.eventos)
                .filter((event: any) =>
                    event?.status_evento === 'ativo' &&
                    !enrolledIds.includes(event.id)
                ) || [];
        },
        enabled: !!user?.id && isOpen && !loadingEnrolled,
    });

    const handleSelectEvent = (eventId: string) => {
        haptics.impact('light');
        setCurrentEventId(eventId);
        onClose();
    };

    const handleEnrollClick = (event: Event) => {
        haptics.impact('medium');
        setEventToEnroll(event);
        setSelectedRole(null);
    };

    const handleConfirmEnroll = async () => {
        if (!eventToEnroll || !selectedRole) return;

        haptics.impact('light');

        try {
            await eventRegistration.mutateAsync({
                eventId: eventToEnroll.id,
                selectedRole: selectedRole,
            });

            haptics.success();
            toast.success(t('eventSelector.enrollSuccess'));

            // Refresh lists
            await refetchEnrolled();
            await refetchAvailable();

            // Clear selection and go to enrolled tab
            setEventToEnroll(null);
            setSelectedRole(null);
            setActiveTab('enrolled');

            // Auto-select the event
            setCurrentEventId(eventToEnroll.id);

        } catch (error: any) {
            haptics.warning();
            console.error('Error enrolling in event:', error);
            toast.error(error.message || t('eventSelector.enrollError'));
        }
    };

    // Format date using current locale
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const locale = i18n.language === 'pt-BR' ? 'pt-BR' :
            i18n.language === 'es-ES' ? 'es-ES' : 'en-US';
        return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
    };

    // Get role display text
    const getRoleText = (perfil: string | undefined) => {
        switch (perfil) {
            case 'ATL': return t('eventSelector.roleAthlete');
            case 'PGR': return t('eventSelector.roleGeneral');
            default: return '';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Bottom Sheet - positioned above bottom nav */}
            <div className="fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col" style={{ bottom: '72px' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">{t('eventSelector.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`flex-1 py-3 font-medium transition-colors ${activeTab === 'enrolled'
                            ? 'text-green-800 border-b-2 border-green-800'
                            : 'text-gray-500'
                            }`}
                    >
                        {t('eventSelector.myEvents')}
                    </button>
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-3 font-medium transition-colors ${activeTab === 'available'
                            ? 'text-green-800 border-b-2 border-green-800'
                            : 'text-gray-500'
                            }`}
                    >
                        {t('eventSelector.available')}
                    </button>
                </div>

                {/* Content - Increased padding bottom for better scroll */}
                <div className="flex-1 overflow-y-auto p-4 pb-8">
                    {activeTab === 'enrolled' ? (
                        loadingEnrolled ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
                            </div>
                        ) : enrolledEvents.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">{t('eventSelector.noEnrolled')}</p>
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className="px-4 py-2 bg-green-800 text-white rounded-lg font-medium"
                                >
                                    {t('eventSelector.viewAvailable')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {enrolledEvents.map((event: EnrolledEvent) => (
                                    <button
                                        key={event.id}
                                        onClick={() => handleSelectEvent(event.id)}
                                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${currentEventId === event.id
                                            ? 'border-green-800 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-lg mb-1">{event.nome}</h3>
                                            {currentEventId === event.id && (
                                                <Check className="w-5 h-5 text-green-800 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.cidade}, {event.estado}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(event.data_inicio_evento)}
                                            </span>
                                        </div>
                                        {/* Show enrolled role */}
                                        {event.perfil_tipo && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className={`text-xs px-2 py-1 rounded-full ${event.perfil_tipo === 'ATL'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {getRoleText(event.perfil_tipo)}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        loadingAvailable ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
                            </div>
                        ) : availableEvents.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">{t('eventSelector.noAvailable')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableEvents.map((event: Event) => (
                                    <div
                                        key={event.id}
                                        className="p-4 rounded-lg border-2 border-gray-200 bg-white"
                                    >
                                        <h3 className="font-semibold text-lg mb-1">{event.nome}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.cidade}, {event.estado}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(event.data_inicio_evento)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleEnrollClick(event)}
                                            className="w-full py-2 bg-green-800 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            {t('eventSelector.enrollButton')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Enrollment Role Selection Modal */}
            {eventToEnroll && (
                <>
                    <div
                        className="fixed inset-0 bg-black/70 z-[60]"
                        onClick={() => setEventToEnroll(null)}
                    />
                    <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">{t('eventSelector.selectRole')}</h3>
                        <p className="text-gray-600 mb-4">{eventToEnroll.nome}</p>

                        {/* Role Options */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => setSelectedRole('ATL')}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedRole === 'ATL'
                                    ? 'border-green-800 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="w-5 h-5 text-green-800" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('eventSelector.roleAthlete')}</p>
                                        <p className="text-sm text-gray-500">{t('eventSelector.roleAthleteDesc')}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedRole('PGR')}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedRole === 'PGR'
                                    ? 'border-green-800 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <UserCheck className="w-5 h-5 text-blue-800" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('eventSelector.roleGeneral')}</p>
                                        <p className="text-sm text-gray-500">{t('eventSelector.roleGeneralDesc')}</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEventToEnroll(null)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmEnroll}
                                disabled={!selectedRole || eventRegistration.isPending}
                                className="flex-1 py-3 bg-green-800 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {eventRegistration.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    t('eventSelector.confirmEnroll')
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default MobileEventSelector;
