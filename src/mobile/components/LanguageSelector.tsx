import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const LANGUAGES = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
];

interface LanguageSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LanguageSelector({ open, onOpenChange }: LanguageSelectorProps) {
    const { i18n, t } = useTranslation();

    const changeLanguage = async (langCode: string) => {
        await i18n.changeLanguage(langCode);
        localStorage.setItem('olimpia-language', langCode);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm mx-auto rounded-xl p-0 overflow-hidden bg-white shadow-2xl border-0">
                <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-green-50 to-white">
                    <DialogTitle className="text-xl font-bold text-center text-green-900">
                        {t('profile.selectLanguage')}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-3">
                    {LANGUAGES.map((lang) => {
                        const isSelected = i18n.language === lang.code;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`
                                    w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                                    ${isSelected
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-green-100 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl filter drop-shadow-sm">{lang.flag}</span>
                                    <span className={`font-medium ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="bg-green-100 p-1.5 rounded-full">
                                        <Check className="w-4 h-4 text-green-700" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 pt-0 text-center">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {t('common.cancel') || 'Cancelar'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
