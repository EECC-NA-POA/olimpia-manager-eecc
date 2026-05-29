import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Check, AlertCircle, Clock, XCircle, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentProofUpload } from '../components/PaymentProofUpload';
import { submitEventPayment } from '@/services/paymentService';
import { uploadEventPaymentProof } from '@/services/storageService';
import { useAthletePaymentStatus } from '@/components/athlete-dashboard/hooks/useAthletePaymentStatus';

export default function MobilePayment() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, currentEventId } = useAuth();
    const { toast } = useToast();
    const [showUpload, setShowUpload] = useState(false);

    // Use the proper hook that checks for exempt status
    const { data: paymentStatus, isLoading: loading, refetch } = useAthletePaymentStatus(user?.id, currentEventId);

    const handleCustomUpload = async (base64: string, format: string): Promise<string> => {
        if (!user || !currentEventId) throw new Error('Missing user or event');
        // Upload to storage
        const url = await uploadEventPaymentProof(user.id, currentEventId, base64, format);
        // Create/Update payment record
        await submitEventPayment(user.id, currentEventId, url);
        return url;
    };

    const handleUploadComplete = (url: string) => {
        refetch();
        setShowUpload(false);
        toast({
            title: t('common.success'),
            description: t('enrollments.uploadSuccess'),
        });
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'isento':
            case 'confirmado':
            case 'aprovado': return 'bg-green-50 border-green-200 text-green-700';
            case 'rejeitado': return 'bg-red-50 border-red-200 text-red-700';
            case 'pendente': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case 'isento': return <CheckCircle2 className="w-8 h-8 text-green-600" />;
            case 'confirmado':
            case 'aprovado': return <Check className="w-8 h-8 text-green-600" />;
            case 'rejeitado': return <XCircle className="w-8 h-8 text-red-600" />;
            case 'pendente': return <Clock className="w-8 h-8 text-yellow-600" />;
            default: return <AlertCircle className="w-8 h-8 text-gray-400" />;
        }
    };

    const getStatusText = (status: string | null) => {
        switch (status) {
            case 'isento': return t('payment.statusExempt');
            case 'confirmado':
            case 'aprovado': return t('payment.statusConfirmed');
            case 'rejeitado': return t('payment.statusRejected');
            case 'pendente': return t('payment.statusPending');
            default: return t('payment.statusDefault');
        }
    };

    const getStatusDescription = (status: string | null) => {
        switch (status) {
            case 'isento': return t('payment.descExempt');
            case 'confirmado':
            case 'aprovado': return t('payment.descConfirmed');
            case 'rejeitado': return t('payment.descRejected');
            case 'pendente': return t('payment.descPending');
            default: return t('payment.descDefault');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
            </div>
        );
    }

    const status = paymentStatus?.status_pagamento || null;
    const isExempt = paymentStatus?.isento || status === 'isento';
    const isPaid = status === 'confirmado' || status === 'aprovado';
    const needsPayment = !isExempt && !isPaid;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 safe-area-top">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="ml-2 text-lg font-bold text-gray-900">
                    {t('payment.eventPayment')}
                </h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Status Card */}
                <div className={`p-6 rounded-xl border flex flex-col items-center text-center ${getStatusColor(isExempt ? 'isento' : status)}`}>
                    <div className="mb-4 bg-white p-3 rounded-full shadow-sm">
                        {getStatusIcon(isExempt ? 'isento' : status)}
                    </div>
                    <h2 className="text-xl font-bold mb-2">
                        {getStatusText(isExempt ? 'isento' : status)}
                    </h2>
                    <p className="text-sm opacity-90 max-w-xs">
                        {getStatusDescription(isExempt ? 'isento' : status)}
                    </p>
                </div>

                {/* Payment Instructions / Amount - Only show if not exempt */}
                {!isExempt && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">{t('payment.summary')}</span>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">{t('payment.totalAmount')}</span>
                                <span className="text-2xl font-bold text-green-700">
                                    {paymentStatus?.valor_taxa != null
                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentStatus.valor_taxa)
                                        : t('payment.toBeDecided')}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {t('payment.feeNote')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Exempt Card - Show when exempt */}
                {isExempt && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-gray-700">{t('payment.eventFee')}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">{t('payment.status')}</span>
                                <span className="text-lg font-bold text-green-700">{t('payment.statusExempt')}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {t('payment.exemptNoPayment')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions - Only show upload button if not exempt and not already paid */}
                {needsPayment && status !== 'pendente' && (
                    <button
                        onClick={() => setShowUpload(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <Upload className="w-5 h-5" />
                        {t('payment.sendProof')}
                    </button>
                )}

                {/* Resubmit button for rejected or pending */}
                {!isExempt && (status === 'pendente' || status === 'rejeitado') && (
                    <button
                        onClick={() => setShowUpload(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <Upload className="w-5 h-5" />
                        {status === 'rejeitado' ? t('payment.sendNewProof') : t('payment.resendProof')}
                    </button>
                )}

                {/* Existing Proof Preview */}
                {paymentStatus?.comprovante_url && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 ml-1">{t('payment.proofSent')}</h3>
                        <div
                            className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                            onClick={() => window.open(paymentStatus.comprovante_url!, '_blank')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={paymentStatus.comprovante_url}
                                        alt="Thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{t('payment.pixProof')}</p>
                                    <p className="text-xs text-gray-500">
                                        {t('payment.clickToView')}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <PaymentProofUpload
                    enrollmentId={0} // Ignored when customUpload is provided
                    onSuccess={handleUploadComplete}
                    onClose={() => setShowUpload(false)}
                    customUploadFn={handleCustomUpload}
                />
            )}
        </div>
    );
}
