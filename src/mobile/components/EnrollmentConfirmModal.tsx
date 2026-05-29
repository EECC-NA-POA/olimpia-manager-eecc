import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface EnrollmentConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modalityName: string;
    category: string | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function EnrollmentConfirmModal({
    open,
    onOpenChange,
    modalityName,
    category,
    onConfirm,
    isLoading,
}: EnrollmentConfirmModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                    <DialogTitle>{t('enrollments.confirmEnrollment')}</DialogTitle>
                    <DialogDescription>
                        {t('enrollments.confirmEnrollmentDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-gray-900">{modalityName}</p>
                        {category && (
                            <p className="text-sm text-gray-500 mt-1">{category}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium disabled:opacity-50"
                        style={{ minHeight: '48px' }}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
                        style={{ backgroundColor: '#1B5E20', minHeight: '48px' }}
                    >
                        {isLoading ? t('common.loading') : t('enrollments.confirm')}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
