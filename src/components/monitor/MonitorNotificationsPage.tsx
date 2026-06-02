import { LoadingImage } from '@/components/ui/loading-image';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, BellPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useAuth } from '@/contexts/AuthContext';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';
import { submitNotification } from '@/components/notifications/services/createNotificationService';

export default function MonitorNotificationsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { activeEvent } = useActiveEvent();

    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Buscar modalidades gerenciadas por este monitor
    const { data: rawMonitorModalities, isLoading } = useMonitorModalities();

    // Filtrar e construir opções consistentes
    const monitorModalities = (rawMonitorModalities || []).map(m => ({
        modalidade_id: m.modalidade_id,
        nome: m.modalidades?.nome || `Modalidade ${m.modalidade_id}`
    }));

    const [selectedModalities, setSelectedModalities] = useState<any[]>([]);

    // Auto-selecionar todas as modalidades por padrão
    useEffect(() => {
        if (monitorModalities && monitorModalities.length > 0 && selectedModalities.length === 0) {
            setSelectedModalities(monitorModalities.map(m => m.modalidade_id));
        }
    }, [monitorModalities]);

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

        if (selectedModalities.length === 0) {
            toast.error('Selecione pelo menos uma modalidade para notificar');
            return;
        }

        if (!activeEvent?.id || !user?.id) {
            toast.error('Usuário ou Evento ativo não encontrado.');
            return;
        }

        setIsSubmitting(true);

        try {
            await submitNotification(
                {
                    titulo,
                    mensagem,
                    eventId: activeEvent.id,
                    destinatarios: [],
                    modalidades: selectedModalities
                },
                user.id,
                'filosofo_monitor'
            );

            toast.success(t('notifications.createdSuccessfully', 'Notificação enviada com sucesso!'));
            setTitulo('');
            setMensagem('');
        } catch (error) {
            console.error('Error creating web notification by monitor:', error);
            toast.error(t('notifications.sendError', 'Erro ao enviar notificação.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex bg-transparent h-40 items-center justify-center">
                <LoadingImage size="sm" />
            </div>
        );
    }

    return (
        <Card className="animate-fade-in border-sidebar-border bg-card/95 backdrop-blur-sm shadow-md">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-olimpics-green-primary/10 rounded-lg">
                        <BellPlus className="h-5 w-5 text-olimpics-green-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Notificações para Modalidades</CardTitle>
                        <CardDescription>
                            Envie comunicados ou convocações para todos os atletas inscritos nas suas modalidades.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form id="monitor-notification-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                        <div className="space-y-3">
                            <Label className="text-foreground font-semibold">Notificar Modalidades (Múltipla Escolha)</Label>
                            {monitorModalities?.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-2 border border-dashed rounded-md bg-muted/20">
                                    Você não tem modalidades associadas para notificar.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {monitorModalities?.map(m => (
                                        <label key={m.modalidade_id} className="flex items-center space-x-2 bg-background p-2 rounded-md border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
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
                                                className="rounded border-input text-olimpics-green-primary focus:ring-olimpics-green-primary"
                                            />
                                            <span className="text-sm text-foreground flex-1 font-medium select-none">{m.nome}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="titulo" className="text-foreground font-semibold">{t('notifications.titleLabel')} <span className="text-red-500">*</span></Label>
                            <Input
                                id="titulo"
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder={t('notifications.titlePlaceholder')}
                                required
                                className="bg-background focus-visible:ring-olimpics-green-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mensagem" className="text-foreground font-semibold">{t('notifications.messageLabel')} <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="mensagem"
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder={t('notifications.messagePlaceholder')}
                                rows={6}
                                required
                                className="bg-background focus-visible:ring-olimpics-green-primary resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || monitorModalities.length === 0}
                            className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white shadow-md flex items-center justify-center gap-2 min-w-[200px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    {t('common.sending', 'Enviando...')}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    {t('notifications.sendNotification')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
