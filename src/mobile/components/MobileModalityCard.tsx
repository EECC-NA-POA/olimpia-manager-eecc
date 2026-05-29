import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileModalityCardProps {
    id: number;
    name: string;
    category: string | null;
    type: string;
    currentVacancies: number;
    maxVacancies: number | null;
    onEnroll: (id: number) => void;
    isEnrolling?: boolean;
}

export function MobileModalityCard({
    id,
    name,
    category,
    type,
    currentVacancies,
    maxVacancies,
    onEnroll,
    isEnrolling,
}: MobileModalityCardProps) {
    const { t } = useTranslation();

    const hasLimit = maxVacancies !== null && maxVacancies > 0;
    const spotsLeft = hasLimit ? maxVacancies - currentVacancies : null;
    const isFull = hasLimit && spotsLeft !== null && spotsLeft <= 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {category}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Vacancy info */}
            {hasLimit && (
                <div className="flex items-center gap-2 mt-3 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className={isFull ? 'text-red-600' : 'text-gray-600'}>
                        {currentVacancies}/{maxVacancies} {t('enrollments.enrolled')}
                    </span>
                    {!isFull && spotsLeft !== null && (
                        <span className="text-green-600 font-medium">
                            ({spotsLeft} {t('enrollments.spotsLeft')})
                        </span>
                    )}
                </div>
            )}

            {/* Enroll button */}
            <button
                onClick={() => onEnroll(id)}
                disabled={isEnrolling || isFull}
                className="mt-4 w-full py-3 rounded-lg font-medium text-white disabled:opacity-50 transition-colors"
                style={{
                    backgroundColor: isFull ? '#9CA3AF' : '#1B5E20',
                    minHeight: '48px',
                }}
            >
                {isFull
                    ? t('enrollments.full')
                    : isEnrolling
                        ? t('common.loading')
                        : t('enrollments.enroll')}
            </button>
        </div>
    );
}
