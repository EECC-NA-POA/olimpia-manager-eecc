import { useTranslation } from 'react-i18next';
import { Medal, Trophy } from 'lucide-react';

interface MobileScoreCardProps {
    modalityName: string;
    category: string | null;
    position: number | null;
    points: number | null;
    date: string;
}

export function MobileScoreCard({
    modalityName,
    category,
    position,
    points,
    date,
}: MobileScoreCardProps) {
    const { t, i18n } = useTranslation();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(i18n.language || 'pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getPositionColor = (pos: number | null) => {
        if (pos === 1) return '#FFD700'; // Gold
        if (pos === 2) return '#C0C0C0'; // Silver
        if (pos === 3) return '#CD7F32'; // Bronze
        return '#6B7280'; // Gray
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{modalityName}</h3>
                    {category && (
                        <span className="text-sm text-gray-500">{category}</span>
                    )}
                </div>

                {position && (
                    <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${getPositionColor(position)}20` }}
                    >
                        <Medal
                            className="w-4 h-4"
                            style={{ color: getPositionColor(position) }}
                        />
                        <span
                            className="font-bold text-sm"
                            style={{ color: getPositionColor(position) }}
                        >
                            {position}º
                        </span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                        {points !== null ? `${points} ${t('scores.points')}` : '-'}
                    </span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(date)}</span>
            </div>
        </div>
    );
}
