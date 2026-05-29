import { ChevronDown, ChevronUp, X, Camera, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MobileEnrollmentCardProps {
    id: number;
    modalityName: string;
    category: string | null;
    status: string;
    paymentProofUrl?: string | null;
    onWithdraw?: (id: number) => void;
    onUploadProof?: (id: number) => void;
    isWithdrawing?: boolean;
}

const statusColors: Record<string, { color: string; bgColor: string }> = {
    confirmada: { color: '#16A34A', bgColor: '#DCFCE7' },
    confirmado: { color: '#16A34A', bgColor: '#DCFCE7' },
    pendente: { color: '#CA8A04', bgColor: '#FEF9C3' },
    cancelada: { color: '#DC2626', bgColor: '#FEE2E2' },
    cancelado: { color: '#DC2626', bgColor: '#FEE2E2' },
    rejeitada: { color: '#DC2626', bgColor: '#FEE2E2' },
    rejeitado: { color: '#DC2626', bgColor: '#FEE2E2' },
};

export function MobileEnrollmentCard({
    id,
    modalityName,
    category,
    status,
    paymentProofUrl,
    onWithdraw,
    onUploadProof,
    isWithdrawing,
}: MobileEnrollmentCardProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    const colors = statusColors[status.toLowerCase()] || {
        color: '#6B7280',
        bgColor: '#F3F4F6',
    };
    const statusLabel = t(`enrollments.status.${status.toLowerCase()}`, { defaultValue: status });

    const canWithdraw = status.toLowerCase() === 'pendente';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between text-left"
                style={{ minHeight: '64px' }}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {modalityName}
                    </h3>
                    {category && (
                        <p className="text-sm text-gray-500 truncate">{category}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 ml-3">
                    <span
                        className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            color: colors.color,
                            backgroundColor: colors.bgColor,
                        }}
                    >
                        {statusLabel}
                    </span>
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    {/* Payment Proof Upload Section */}
                    {/* Payment proof logic moved to Event Payment screen */}

                    {canWithdraw && onWithdraw && (
                        <button
                            onClick={() => onWithdraw(id)}
                            disabled={isWithdrawing}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 text-red-600 font-medium disabled:opacity-50"
                            style={{ minHeight: '48px' }}
                        >
                            <X className="w-4 h-4" />
                            {isWithdrawing
                                ? t('common.loading')
                                : t('enrollments.withdraw')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
