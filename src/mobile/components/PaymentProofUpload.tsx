// Payment Proof Upload Modal Component
// Handles photo capture and upload to Supabase Storage

import { useState } from 'react';
import { X, Camera, Image as ImageIcon, RefreshCw, Upload, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { takePaymentProof, isCameraAvailable } from '@/services/cameraService';
import {
    uploadPaymentProof,
    updateEnrollmentPaymentProof,
    validateFileSize,
} from '@/services/storageService';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentProofUploadProps {
    enrollmentId: number;
    onSuccess: (url: string) => void;
    onClose: () => void;
    customUploadFn?: (base64: string, format: string) => Promise<string>;
}

type UploadState = 'selection' | 'preview' | 'uploading' | 'success' | 'error';

export function PaymentProofUpload({
    enrollmentId,
    onSuccess,
    onClose,
    customUploadFn,
}: PaymentProofUploadProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { toast } = useToast();
    const haptics = useHaptics();

    const [state, setState] = useState<UploadState>('selection');
    const [photoData, setPhotoData] = useState<{ dataUrl: string; base64: string; format: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSourceSelect = async (source: 'camera' | 'gallery') => {
        if (!isCameraAvailable()) {
            toast({
                title: t('common.error'),
                description: t('enrollments.cameraNotAvailable'),
                variant: 'destructive',
            });
            return;
        }

        haptics.impact('light');

        try {
            const photo = await takePaymentProof(source);

            if (!photo || !photo.base64String) {
                // User cancelled
                return;
            }

            // Validate file size
            if (!validateFileSize(photo.base64String)) {
                haptics.error();
                setErrorMessage(t('enrollments.fileTooLarge'));
                setState('error');
                return;
            }

            setPhotoData({
                dataUrl: photo.dataUrl,
                base64: photo.base64String,
                format: photo.format,
            });
            setState('preview');
            haptics.impact('medium');
        } catch (error: any) {
            console.error('Error capturing photo:', error);
            haptics.error();

            if (error?.message?.includes('permission')) {
                setErrorMessage(t('enrollments.cameraPermissionDenied'));
            } else {
                setErrorMessage(t('common.error'));
            }
            setState('error');
        }
    };

    const handleRetake = () => {
        haptics.impact('light');
        setPhotoData(null);
        setState('selection');
    };

    const handleUpload = async () => {
        if (!photoData || !user) return;

        haptics.impact('medium');
        setState('uploading');

        try {
            let url: string;

            if (customUploadFn) {
                // Use custom upload logic (e.g. for event payments)
                url = await customUploadFn(photoData.base64, photoData.format);
            } else {
                // Default logic for enrollments
                // Upload to Storage
                url = await uploadPaymentProof(
                    user.id,
                    enrollmentId,
                    photoData.base64,
                    photoData.format
                );

                // Update database
                await updateEnrollmentPaymentProof(enrollmentId, url);
            }

            setState('success');
            haptics.success();

            toast({
                title: t('common.success'),
                description: t('enrollments.uploadSuccess'),
            });

            // Close modal after short delay
            setTimeout(() => {
                onSuccess(url);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error uploading proof:', error);
            haptics.error();
            setErrorMessage(t('enrollments.uploadError'));
            setState('error');
        }
    };

    const handleClose = () => {
        haptics.impact('light');
        onClose();
    };

    const isNative = isCameraAvailable();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {t('enrollments.uploadProof')}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Selection State */}
                    {state === 'selection' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 text-center mb-6">
                                {t('enrollments.chooseSource')}
                            </p>

                            {isNative ? (
                                <>
                                    <button
                                        onClick={() => handleSourceSelect('camera')}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        {t('enrollments.takePhoto')}
                                    </button>

                                    <button
                                        onClick={() => handleSourceSelect('gallery')}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                        {t('enrollments.chooseGallery')}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {t('enrollments.cameraNotAvailable')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview State */}
                    {state === 'preview' && photoData && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={photoData.dataUrl}
                                    alt="Payment proof preview"
                                    className="w-full h-auto"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {t('enrollments.retake')}
                                </button>

                                <button
                                    onClick={handleUpload}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                                >
                                    <Upload className="w-4 h-4" />
                                    {t('enrollments.send')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Uploading State */}
                    {state === 'uploading' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">
                                {t('enrollments.uploading')}
                            </p>
                        </div>
                    )}

                    {/* Success State */}
                    {state === 'success' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-900 font-semibold text-lg">
                                {t('enrollments.uploadSuccess')}
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {state === 'error' && (
                        <div className="space-y-4">
                            <div className="py-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-gray-900 font-semibold text-lg mb-2">
                                    {t('common.error')}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {errorMessage}
                                </p>
                            </div>

                            <button
                                onClick={() => setState('selection')}
                                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                            >
                                {t('common.tryAgain')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
