import { useTranslation } from 'react-i18next';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegisteredModalities } from '@/hooks/useRegisteredModalities';
import { useAvailableModalitiesForAthlete } from '@/components/athlete-dashboard/hooks/useAvailableModalitiesForAthlete';
import { useModalityMutations } from '@/hooks/useModalityMutations';
import { useHaptics } from '@/hooks/useHaptics';
import { MobileEnrollmentCard } from '../components/MobileEnrollmentCard';
import { MobileModalityCard } from '../components/MobileModalityCard';
import { EnrollmentConfirmModal } from '../components/EnrollmentConfirmModal';
import { PaymentProofUpload } from '../components/PaymentProofUpload';

type Tab = 'my' | 'available';

interface ModalityToEnroll {
    id: number;
    name: string;
    category: string | null;
}

/**
 * MobileEnrollments - Athlete's enrollments list with tabs
 */
function MobileEnrollments() {
    const { t } = useTranslation();
    const { user, currentEventId } = useAuth();
    const haptics = useHaptics();

    const [activeTab, setActiveTab] = useState<Tab>('my');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalityToEnroll, setModalityToEnroll] = useState<ModalityToEnroll | null>(null);
    const [enrollmentIdForProof, setEnrollmentIdForProof] = useState<number | null>(null);

    // Data hooks
    const {
        data: myEnrollments = [],
        isLoading: enrollmentsLoading,
        refetch: refetchEnrollments,
    } = useRegisteredModalities(user?.id, currentEventId);

    const {
        data: availableModalities = [],
        isLoading: availableLoading,
        refetch: refetchAvailable,
    } = useAvailableModalitiesForAthlete(user?.id, currentEventId);

    const { registerMutation, withdrawMutation } = useModalityMutations(user?.id, currentEventId);

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        haptics.impact('light');
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchEnrollments(),
                refetchAvailable(),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchEnrollments, refetchAvailable, haptics]);

    // Withdraw handler
    const handleWithdraw = (enrollmentId: number) => {
        haptics.warning();
        withdrawMutation.mutate(enrollmentId);
    };

    // Payment proof upload handler
    const handleUploadProof = (enrollmentId: number) => {
        haptics.impact('medium');
        setEnrollmentIdForProof(enrollmentId);
    };

    const handleProofUploadSuccess = async (url: string) => {
        await refetchEnrollments();
    };

    // Enroll handlers
    const handleEnrollClick = (modality: ModalityToEnroll) => {
        setModalityToEnroll(modality);
    };

    const handleEnrollConfirm = () => {
        if (modalityToEnroll) {
            registerMutation.mutate(modalityToEnroll.id, {
                onSuccess: () => {
                    haptics.success();
                    setModalityToEnroll(null);
                },
            });
        }
    };

    const isLoading = activeTab === 'my' ? enrollmentsLoading : availableLoading;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">
                    {t('enrollments.title')}
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('my')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'my'
                        ? 'text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                    style={activeTab === 'my' ? { backgroundColor: '#1B5E20' } : undefined}
                >
                    {t('enrollments.myEnrollments')} ({myEnrollments.length})
                </button>
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'available'
                        ? 'text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                    style={activeTab === 'available' ? { backgroundColor: '#1B5E20' } : undefined}
                >
                    {t('enrollments.available')} ({availableModalities.length})
                </button>
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
            ) : activeTab === 'my' ? (
                /* My Enrollments Tab */
                myEnrollments.length > 0 ? (
                    <div className="space-y-3">
                        {myEnrollments.map((enrollment: any) => (
                            <MobileEnrollmentCard
                                key={enrollment.id}
                                id={enrollment.id}
                                modalityName={enrollment.modalidade?.nome || t('schedule.modality')}
                                category={enrollment.modalidade?.categoria}
                                status={enrollment.status}
                                paymentProofUrl={enrollment.payment_proof_url}
                                onWithdraw={handleWithdraw}
                                onUploadProof={handleUploadProof}
                                isWithdrawing={withdrawMutation.isPending}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">
                            {t('enrollments.noEnrollments')}
                        </p>
                        <button
                            onClick={() => setActiveTab('available')}
                            className="px-6 py-3 rounded-lg text-white font-medium"
                            style={{ backgroundColor: '#1B5E20', minHeight: '48px' }}
                        >
                            {t('enrollments.browse')}
                        </button>
                    </div>
                )
            ) : (
                /* Available Modalities Tab */
                availableModalities.length > 0 ? (
                    <div className="space-y-3">
                        {availableModalities.map((modality: any) => (
                            <MobileModalityCard
                                key={modality.id}
                                id={modality.id}
                                name={modality.nome}
                                category={modality.categoria}
                                type={modality.tipo_modalidade}
                                currentVacancies={modality.vagas_ocupadas || 0}
                                maxVacancies={modality.limite_vagas}
                                onEnroll={() => handleEnrollClick({
                                    id: modality.id,
                                    name: modality.nome,
                                    category: modality.categoria,
                                })}
                                isEnrolling={registerMutation.isPending}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">
                            {t('enrollments.noAvailable')}
                        </p>
                    </div>
                )
            )}

            {/* Enrollment Confirmation Modal */}
            <EnrollmentConfirmModal
                open={!!modalityToEnroll}
                onOpenChange={(open) => !open && setModalityToEnroll(null)}
                modalityName={modalityToEnroll?.name || ''}
                category={modalityToEnroll?.category || null}
                onConfirm={handleEnrollConfirm}
                isLoading={registerMutation.isPending}
            />

            {/* Payment Proof Upload Modal */}
            {enrollmentIdForProof && (
                <PaymentProofUpload
                    enrollmentId={enrollmentIdForProof}
                    onSuccess={handleProofUploadSuccess}
                    onClose={() => setEnrollmentIdForProof(null)}
                />
            )}
        </div>
    );
}

export default MobileEnrollments;
