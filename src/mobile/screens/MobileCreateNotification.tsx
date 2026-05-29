import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useUserRoleCheck } from '@/hooks/useUserRoleCheck';
import { useDelegacaoFiliais } from '@/hooks/useDelegacoes';
import { submitNotification } from '@/components/notifications/services/createNotificationService';
import { BranchSelector } from '@/components/notifications/components/BranchSelector';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function MobileCreateNotification() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeEvent } = useActiveEvent();

    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verificar papéis do usuário usando banco seguro
    const { data: roleData, isLoading: rolesLoading } = useUserRoleCheck(user?.id, activeEvent?.id || null);
    const isOrganizer = roleData?.isOrganizer || user?.is_master;
    const isRepresentante = roleData?.isRepresentante;
    const isFilosofoMonitor = roleData?.isFilosofoMonitor;

    // Recuperar filiais do escopo de delegação (array) ou fallback para filial_id
    const { data: delegacaoFiliais } = useDelegacaoFiliais(user?.id, activeEvent?.id || undefined);
    const userBranchIds = delegacaoFiliais || (user?.filial_id ? [user.filial_id] : []);

    // Buscar modalidades do monitor se for Filósofo Monitor usando o hook dedicado
    const { data: rawMonitorModalities } = useMonitorModalities();

    // Filtra as modalidades para garantir que não temos null, 
    // embora o !inner incluído no hook garanta isso.
    const monitorModalities = (rawMonitorModalities || []).map(m => ({
        modalidade_id: m.modalidade_id,
        nome: m.modalidades?.nome || `Modalidade ${m.modalidade_id}`
    }));

    const [selectedModalities, setSelectedModalities] = useState<any[]>([]);

    // Auto-selecionar todas se houver modalidades, ou iniciar vazias
    useEffect(() => {
        if (monitorModalities && monitorModalities.length > 0 && selectedModalities.length === 0) {
            setSelectedModalities(monitorModalities.map(m => m.modalidade_id));
        }
    }, [monitorModalities]);

    const hasMultipleRoles = [isOrganizer, isRepresentante, isFilosofoMonitor].filter(Boolean).length > 1;

    // Se o usuário tiver mais de um perfil, começa com null forçando a escolha, caso contrário, usa o que tiver.
    const defaultContext = !hasMultipleRoles
        ? (isOrganizer ? 'organizador' : (isFilosofoMonitor ? 'filosofo_monitor' : 'representante_delegacao'))
        : null;

    const [selectedContext, setSelectedContext] = useState<string | null>(defaultContext);

    const activeRoleIsMonitor = selectedContext === 'filosofo_monitor';
    const activeRoleIsOrganizer = selectedContext === 'organizador';
    const activeRoleIsRep = selectedContext === 'representante_delegacao';

    const tipoAutor = selectedContext || defaultContext;

    const handleBack = () => {
        navigate('/m/notifications');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo.trim()) {
            toast.error(t('notifications.titleRequired', 'O título é obrigatório'));
            return;
        }

        if (!mensagem.trim()) {
            toast.error(t('notifications.messageRequired', 'A mensagem é obrigatória'));
            return;
        }

        if (!tipoAutor) {
            toast.error(t('notifications.contextWarning', 'Selecione como qual perfil você deseja enviar esta notificação.'));
            return;
        }

        // Se for organizador, exige seleção de destinatário
        if (activeRoleIsOrganizer && selectedBranches.length === 0) {
            toast.error(t('notifications.branchRequired', 'Selecione pelo menos um destinatário'));
            return;
        }

        // Se for monitor, exige seleção de modalidades
        if (activeRoleIsMonitor && selectedModalities.length === 0) {
            toast.error(t('notifications.notifyModalitiesRequired', 'Selecione pelo menos uma modalidade para notificar'));
            return;
        }

        // Payload de Destinatarios da Filial
        const destinatariosPayload = activeRoleIsOrganizer ? selectedBranches : (activeRoleIsMonitor ? [] : userBranchIds);

        if (!activeRoleIsOrganizer && !activeRoleIsMonitor && destinatariosPayload.length === 0) {
            toast.error(t('notifications.permissionError'));
            return;
        }

        if (!activeEvent?.id || !user?.id) return;

        setIsSubmitting(true);

        try {
            await submitNotification(
                {
                    titulo,
                    mensagem,
                    eventId: activeEvent.id,
                    destinatarios: destinatariosPayload,
                    modalidades: activeRoleIsMonitor ? selectedModalities : undefined
                },
                user.id,
                tipoAutor as 'organizador' | 'representante_delegacao' | 'filosofo_monitor'
            );

            toast.success(t('notifications.createdSuccessfully', 'Notificação enviada com sucesso!'));
            navigate('/m/notifications');
        } catch (error: any) {
            console.error('Error creating mobile notification:', error);

            // Supabase errors are often plain objects, not Error instances
            let detail = '';
            if (error?.message) {
                detail = error.message;
            } else if (typeof error === 'string') {
                detail = error;
            } else {
                detail = JSON.stringify(error);
            }

            // Mostrar a mensagem de erro específica lançada pelo service
            const errorMessage = `FALHA REAL AQUI: ${detail} - ${error?.details || ''}`;
            toast.error(errorMessage, { duration: 10000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (rolesLoading) {
        return (
            <div className="flex bg-gray-50 h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
            </div>
        );
    }

    // Bloquear acesso se não tiver nenhum papel válido
    if (!isOrganizer && !isRepresentante && !isFilosofoMonitor) {
        return (
            <div className="flex flex-col bg-gray-50 h-full items-center justify-center p-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t('notifications.accessDenied')}</h2>
                <p className="text-gray-600 mb-6">{t('notifications.noPermission')}</p>
                <Button onClick={handleBack} variant="outline">{t('notifications.backToNotifications')}</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50 h-full">
            {/* Header Movelado */}
            <div className="bg-green-800 text-white p-4 shadow-md flex items-center gap-3">
                <button
                    onClick={handleBack}
                    className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition"
                    aria-label={t('notifications.back')}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">{t('notifications.newNotification')}</h1>
            </div>

            {/* Content Formulário */}
            <div className="flex-1 overflow-y-auto p-4">
                <form id="mobile-notification-form" onSubmit={handleSubmit} className="space-y-6">

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">

                        {hasMultipleRoles && (
                            <div className="mb-6 space-y-2 border-b pb-4 border-gray-100">
                                <Label className="text-gray-700 font-medium">{t('notifications.sendContextLabel', 'Enviar Notificação como:')}</Label>
                                <Select value={selectedContext || ''} onValueChange={(val) => setSelectedContext(val)}>
                                    <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                        <SelectValue placeholder={t('notifications.sendContextPlaceholder', 'Selecione o seu perfil de acesso')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isOrganizer && <SelectItem value="organizador">{t('notifications.roleOrganizer', 'Organizador do Evento')}</SelectItem>}
                                        {isRepresentante && <SelectItem value="representante_delegacao">{t('notifications.roleDelegation', 'Representante da Delegação')}</SelectItem>}
                                        {isFilosofoMonitor && <SelectItem value="filosofo_monitor">{t('notifications.roleMonitor', 'Filósofo Monitor (Modalidades)')}</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Mostrar mensagem se nenhum contexto foi selecionado */}
                        {!selectedContext && hasMultipleRoles ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                {t('notifications.contextRequired', 'Por favor, selecione acima o perfil com o qual deseja enviar este comunicado.')}
                            </div>
                        ) : activeRoleIsMonitor ? (
                            <div className="space-y-3">
                                <Label className="text-gray-700 font-medium">{t('notifications.notifyModalitiesLabel', 'Notificar Modalidades')}</Label>
                                {monitorModalities?.length === 0 ? (
                                    <p className="text-sm text-gray-500">{t('notifications.noModalitiesAssigned', 'Você não tem modalidades associadas.')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {monitorModalities?.map(m => (
                                            <label key={m.modalidade_id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedModalities.includes(m.modalidade_id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedModalities([...selectedModalities, m.modalidade_id]);
                                                        } else {
                                                            setSelectedModalities(selectedModalities.filter(id => id !== m.modalidade_id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-olimpics-green-main focus:ring-olimpics-green-main"
                                                />
                                                <span className="text-sm text-gray-700">{m.nome}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label className="text-gray-700 font-medium">{t('notifications.selectDestinationsLabel', 'Selecione o Destino (Filiais)')}</Label>
                                <BranchSelector
                                    eventId={activeEvent?.id || ''}
                                    selectedBranches={selectedBranches}
                                    onBranchChange={setSelectedBranches}
                                    isOrganizer={activeRoleIsOrganizer}
                                    userBranchIds={userBranchIds}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="titulo" className="text-gray-700 font-medium">{t('notifications.titleLabel')} <span className="text-red-500">*</span></Label>
                            <Input
                                id="titulo"
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder={t('notifications.titlePlaceholder')}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mensagem" className="text-gray-700 font-medium">{t('notifications.messageLabel')} <span className="text-red-500">*</span></Label>
                            {/* Mudança: no mobile o RichTextEditor pode ser ruim, usando Textarea nativo */}
                            <Textarea
                                id="mensagem"
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder={t('notifications.messagePlaceholder')}
                                rows={6}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white resize-none"
                            />
                        </div>
                    </div>

                    {/* Warning info about push */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <p><strong>{t('notifications.tip')}:</strong> {t('notifications.tipText')}</p>
                    </div>

                    {/* Espaçamento pro botão flutuante inferior não cobrir o form */}
                    <div className="h-24" />
                </form>
            </div>

            {/* Botão Inferior Fixo */}
            <div
                className="fixed left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50"
                style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
            >
                <Button
                    type="submit"
                    form="mobile-notification-form"
                    disabled={isSubmitting || (hasMultipleRoles && !selectedContext)}
                    className="w-full bg-green-800 hover:bg-green-700 text-white shadow-md flex items-center justify-center gap-2 h-12 text-base font-semibold disabled:opacity-50 disabled:bg-gray-400"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            {t('common.sending', 'Enviando...')}
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {t('notifications.sendNotification')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default MobileCreateNotification;
