import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Star } from 'lucide-react';

interface MobileActivityCardProps {
    id: number;
    name: string;
    time: string;
    endTime?: string;
    location: string;
    modalityName?: string | null;
    isGlobal?: boolean;
    userParticipates?: boolean;
}

export function MobileActivityCard({
    name,
    time,
    endTime,
    location,
    modalityName,
    isGlobal,
    userParticipates,
}: MobileActivityCardProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                    {modalityName && (
                        <span className="text-sm text-gray-500">{modalityName}</span>
                    )}
                </div>
                {userParticipates && !isGlobal && (
                    <span
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: '#1B5E20' }}
                    >
                        <Star className="w-3 h-3" />
                        {t('schedule.youParticipate')}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                        {time}
                        {endTime && ` - ${endTime}`}
                    </span>
                </div>
                {location && (
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{location}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
