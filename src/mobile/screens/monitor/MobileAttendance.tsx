import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    Loader2,
    Search,
    CalendarClock,
    ClipboardList,
    Plus,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMonitorModalities, MonitorModality } from '@/hooks/useMonitorModalities';
import { useModalityAthletes } from '@/hooks/useModalityAthletes';
import { useMonitorMutations } from '@/hooks/useMonitorMutations';
import { useMonitorSessions } from '@/hooks/useMonitorSessions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AthleteAttendance {
    id: string;
    nome_completo: string;
    email: string;
    numero_identificador: string | null;
    status: 'presente' | 'ausente' | 'atrasado';
}

interface Presence {
    atleta_id: string;
    status: 'presente' | 'ausente' | 'atrasado';
    usuarios: { nome_completo: string } | { nome_completo: string }[];
}

// ─── Session presences hook ──────────────────────────────────────────────────
function useSessionPresences(chamadaId: string | null) {
    return useQuery({
        queryKey: ['session-presences', chamadaId],
        queryFn: async () => {
            if (!chamadaId) return [];

            // 1. Fetch basic attendance data (IDs and status)
            const { data: presencesData, error: presencesError } = await supabase
                .from('chamada_presencas')
                .select('atleta_id, status')
                .eq('chamada_id', chamadaId);

            if (presencesError) throw presencesError;
            if (!presencesData || presencesData.length === 0) return [];

            // 2. Fetch athlete names from usuarios table directly
            const athleteIds = presencesData.map(p => p.atleta_id);
            const { data: usersData } = await supabase
                .from('usuarios')
                .select('id, nome_completo')
                .in('id', athleteIds);

            const userMap = new Map(usersData?.map(u => [u.id, u.nome_completo]) || []);

            // Merge data
            return presencesData.map(p => ({
                atleta_id: p.atleta_id,
                status: p.status,
                usuarios: { nome_completo: userMap.get(p.atleta_id) || 'Atleta' }
            })) as Presence[];
        },
        enabled: !!chamadaId,
    });
}

// ─── Session card with expandable presences ─────────────────────────────────
function SessionCard({ session }: { session: any }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { data: presences, isLoading } = useSessionPresences(open ? session.id : null);

    const formatDate = (iso: string) => {
        try { return format(parseISO(iso), "dd/MM/yy · HH:mm", { locale: ptBR }); }
        catch { return iso; }
    };

    const statusStyle = (s: string) =>
        s === 'presente' ? 'bg-green-100 text-green-800' :
            s === 'atrasado' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800';

    const statusLabel = (s: string) => {
        if (s === 'presente') return t('monitor.presentStatus');
        if (s === 'atrasado') return t('monitor.lateStatus');
        return t('monitor.absentStatus');
    };

    const getNome = (p: Presence) =>
        Array.isArray(p.usuarios) ? p.usuarios[0]?.nome_completo : p.usuarios?.nome_completo;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full p-4 flex items-start justify-between gap-2 text-left"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                        {session.descricao || t('monitor.defaultTitle', { modality: '' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(session.data_hora_inicio)}
                    </p>
                </div>
                {open
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                }
            </button>

            {/* Expandable: athlete list */}
            {open && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                        </div>
                    ) : !presences?.length ? (
                        <p className="text-sm text-gray-400 text-center py-2">{t('monitor.noPresences')}</p>
                    ) : (
                        presences.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                                <p className="text-sm text-gray-800 truncate flex-1">{getNome(p)}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle(p.status)}`}>
                                    {statusLabel(p.status)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── History view for a selected modality ────────────────────────────────────
function ModalityHistory({ modality, onBack }: { modality: MonitorModality; onBack: () => void }) {
    const { t } = useTranslation();
    const { data: sessions, isLoading } = useMonitorSessions(modality.id);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                <button onClick={onBack} className="text-green-700">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <p className="text-xs text-green-600 font-medium">{t('monitor.history')}</p>
                    <h3 className="text-sm font-bold text-green-900">{modality.modalidades?.nome}</h3>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : !sessions?.length ? (
                    <div className="text-center py-12 text-gray-400">
                        <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">{t('monitor.noSessions')}</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MobileAttendance() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedModality, setSelectedModality] = useState<{ id: string; name: string } | null>(null);
    const [historyModality, setHistoryModality] = useState<MonitorModality | null>(null);

    const [sessionForm, setSessionForm] = useState({
        data_hora_inicio: (() => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        })(),
        data_hora_fim: '',
        descricao: '',
        observacoes: ''
    });

    const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);
    const [filterText, setFilterText] = useState('');

    const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();
    const { data: athletes, isLoading: athletesLoading } = useModalityAthletes(selectedModality?.id || undefined);
    const { createSessionWithAttendance } = useMonitorMutations();

    useEffect(() => {
        if (athletes && step === 3) {
            setAthletesAttendance(athletes.map(a => ({ ...a, status: 'presente' as const })));
        }
    }, [athletes, step]);

    const handleModalitySelect = (modality: MonitorModality) => {
        if (!modality.modalidades) return;
        setSelectedModality({ id: modality.id, name: modality.modalidades.nome });
        setStep(2);
    };

    const handleStatusChange = (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => {
        setAthletesAttendance(prev => prev.map(a => a.id === athleteId ? { ...a, status } : a));
    };

    const handleSaveSession = async () => {
        if (!selectedModality) return;
        try {
            await createSessionWithAttendance.mutateAsync({
                modalidade_rep_id: selectedModality.id,
                data_hora_inicio: sessionForm.data_hora_inicio,
                data_hora_fim: sessionForm.data_hora_fim || undefined,
                descricao: sessionForm.descricao || `${t('monitor.defaultTitle', { modality: selectedModality.name })}`,
                observacoes: sessionForm.observacoes,
                attendances: athletesAttendance.map(a => ({ atleta_id: a.id, status: a.status }))
            });
            navigate('/m/dashboard');
        } catch { /* handled by hook */ }
    };

    const switchTab = (tab: 'new' | 'history') => {
        setActiveTab(tab);
        setHistoryModality(null);
        setStep(1);
        setSelectedModality(null);
    };

    const filteredAthletes = athletesAttendance.filter(a =>
        a.nome_completo.toLowerCase().includes(filterText.toLowerCase()) ||
        (a.numero_identificador && a.numero_identificador.includes(filterText))
    );

    const counts = {
        presente: athletesAttendance.filter(a => a.status === 'presente').length,
        ausente: athletesAttendance.filter(a => a.status === 'ausente').length,
        atrasado: athletesAttendance.filter(a => a.status === 'atrasado').length
    };

    const handleBack = () => {
        if (activeTab === 'history' && historyModality) { setHistoryModality(null); return; }
        if (activeTab === 'new' && step > 1) { setStep(prev => (prev - 1) as 1 | 2 | 3); return; }
        navigate('/m/dashboard');
    };

    // ── Step renders ──────────────────────────────────────────────────────────
    const renderStep1 = () => (
        <div className="p-4 space-y-3">
            <p className="text-sm text-gray-500">{t('monitor.selectModalityDesc')}</p>
            {modalitiesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
            ) : !modalities?.length ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">{t('monitor.noModality')}</p>
                </div>
            ) : (
                modalities.filter(m => m.modalidades).map((modality) => (
                    <button key={modality.id} onClick={() => handleModalitySelect(modality)}
                        className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-green-50 transition-colors"
                    >
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{modality.modalidades.nome}</h3>
                            <p className="text-sm text-gray-500">{modality.filiais?.nome}</p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>
                ))
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="p-4 space-y-4 pb-8">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('monitor.start')} *</label>
                <input type="datetime-local" value={sessionForm.data_hora_inicio}
                    onChange={e => setSessionForm({ ...sessionForm, data_hora_inicio: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('monitor.end')}</label>
                <input type="datetime-local" value={sessionForm.data_hora_fim}
                    onChange={e => setSessionForm({ ...sessionForm, data_hora_fim: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('monitor.description')}</label>
                <textarea value={sessionForm.descricao}
                    onChange={e => setSessionForm({ ...sessionForm, descricao: e.target.value })}
                    placeholder={t('monitor.descriptionPlaceholder')}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('monitor.notes')}</label>
                <textarea value={sessionForm.observacoes}
                    onChange={e => setSessionForm({ ...sessionForm, observacoes: e.target.value })}
                    placeholder={t('monitor.notesPlaceholder')}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none" />
            </div>
            <button onClick={() => setStep(3)} disabled={!sessionForm.data_hora_inicio}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-medium disabled:opacity-50">
                {t('monitor.continue')}
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="bg-white border-b border-gray-100 p-4 space-y-3 shadow-sm">
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center text-green-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> {counts.presente} {t('monitor.present').toLowerCase()}
                    </div>
                    <div className="flex items-center text-yellow-600 font-semibold">
                        <Clock className="w-4 h-4 mr-1" /> {counts.atrasado} {t('monitor.late').toLowerCase()}
                    </div>
                    <div className="flex items-center text-red-600 font-semibold">
                        <XCircle className="w-4 h-4 mr-1" /> {counts.ausente} {t('monitor.absent').toLowerCase()}
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder={t('monitor.searchPlaceholder')} value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ paddingBottom: 80 }}>
                {athletesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
                ) : filteredAthletes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t('monitor.noAthletes')}</div>
                ) : (
                    filteredAthletes.map(athlete => (
                        <div key={athlete.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="mb-3">
                                <h3 className="font-medium text-gray-900">{athlete.nome_completo}</h3>
                                {athlete.numero_identificador && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        #{athlete.numero_identificador}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {(['presente', 'atrasado', 'ausente'] as const).map(s => (
                                    <button key={s} onClick={() => handleStatusChange(athlete.id, s)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${athlete.status === s
                                            ? s === 'presente' ? 'bg-green-100 text-green-800 border border-green-200'
                                                : s === 'atrasado' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {s === 'presente' ? t('monitor.presentStatus') : s === 'atrasado' ? t('monitor.lateStatus') : t('monitor.absentStatus')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button onClick={handleSaveSession} disabled={createSessionWithAttendance.isPending}
                    className="w-full bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {createSessionWithAttendance.isPending
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Save className="w-5 h-5" />}
                    {t('monitor.save')}
                </button>
            </div>
        </div>
    );

    // ── Header helpers ─────────────────────────────────────────────────────────
    const headerTitle = () => {
        if (activeTab === 'history') return historyModality ? historyModality.modalidades?.nome : t('monitor.history');
        if (step === 1) return t('monitor.newSession');
        return selectedModality?.name ?? (step === 2 ? t('monitor.config') : t('monitor.title'));
    };

    const headerSub = () => {
        if (activeTab === 'history') return historyModality ? t('monitor.pastSessions') : t('monitor.selectModality');
        if (step === 1) return t('monitor.selectModality');
        if (step === 2) return t('monitor.config');
        return t('monitor.title'); // or something else
    };

    const showTabs = (activeTab === 'new' && step === 1) || (activeTab === 'history' && !historyModality);

    // ── Layout ─────────────────────────────────────────────────────────────────
    return (
        <div
            className="flex flex-col bg-gray-50 relative"
            style={{ minHeight: '100dvh', height: '100dvh', paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-1 -ml-1 text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-gray-900 leading-tight truncate">{headerTitle()}</h1>
                        <p className="text-xs text-gray-500">{headerSub()}</p>
                    </div>
                </div>
                {showTabs && (
                    <div className="flex mt-3 bg-gray-100 rounded-lg p-1 gap-1">
                        <button onClick={() => switchTab('new')}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'new' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500'}`}
                        >
                            <Plus className="w-3.5 h-3.5" /> {t('monitor.newSession')}
                        </button>
                        <button onClick={() => switchTab('history')}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'history' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500'}`}
                        >
                            <ClipboardList className="w-3.5 h-3.5" /> {t('monitor.history')}
                        </button>
                    </div>
                )}
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'new' && (
                    <div className={`flex flex-col flex-1 ${step === 3 ? 'overflow-hidden relative' : 'overflow-y-auto'}`}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>
                )}
                {activeTab === 'history' && !historyModality && (
                    <div className="p-4 space-y-3 overflow-y-auto flex-1">
                        <p className="text-sm text-gray-500">{t('monitor.emptyHistory')}</p>
                        {modalitiesLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
                        ) : (
                            modalities?.filter(m => m.modalidades).map(modality => (
                                <button key={modality.id} onClick={() => setHistoryModality(modality)}
                                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-green-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900">{modality.modalidades.nome}</h3>
                                        <p className="text-sm text-gray-500">{modality.filiais?.nome}</p>
                                    </div>
                                    <ClipboardList className="w-5 h-5 text-gray-400" />
                                </button>
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'history' && historyModality && (
                    <ModalityHistory modality={historyModality} onBack={() => setHistoryModality(null)} />
                )}
            </div>
        </div>
    );
}
