// Camera Service - Handles camera and gallery interactions
// Uses Capacitor Camera API

import { Capacitor } from '@capacitor/core';

// Dynamically import Camera plugin only on native platforms
let Camera: any = null;

async function loadCameraPlugin() {
    if (!Capacitor.isNativePlatform()) {
        console.log('Camera not available on web platform');
        return null;
    }

    try {
        const module = await import('@capacitor/camera');
        return module.Camera;
    } catch (error) {
        console.error('Failed to load Camera plugin:', error);
        return null;
    }
}

export interface PhotoResult {
    base64String?: string;
    dataUrl: string;
    format: string;
}

/**
 * Take a photo using the device camera
 */
export async function takePhoto(): Promise<PhotoResult | null> {
    const CameraPlugin = await loadCameraPlugin();
    if (!CameraPlugin) return null;

    try {
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');

        const image = await CameraPlugin.getPhoto({
            quality: 80,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            saveToGallery: false,
        });

        return {
            base64String: image.base64String,
            dataUrl: `data:image/${image.format};base64,${image.base64String}`,
            format: image.format,
        };
    } catch (error: any) {
        if (error?.message?.includes('User cancelled')) {
            console.log('User cancelled camera');
            return null;
        }
        console.error('Error taking photo:', error);
        throw error;
    }
}

/**
 * Pick an image from the device gallery
 */
export async function pickFromGallery(): Promise<PhotoResult | null> {
    const CameraPlugin = await loadCameraPlugin();
    if (!CameraPlugin) return null;

    try {
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');

        const image = await CameraPlugin.getPhoto({
            quality: 80,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
        });

        return {
            base64String: image.base64String,
            dataUrl: `data:image/${image.format};base64,${image.base64String}`,
            format: image.format,
        };
    } catch (error: any) {
        if (error?.message?.includes('User cancelled')) {
            console.log('User cancelled gallery picker');
            return null;
        }
        console.error('Error picking from gallery:', error);
        throw error;
    }
}

/**
 * Take a payment proof photo (prompts user to choose camera or gallery)
 * This function is used by the PaymentProofUpload component
 * The actual UI prompt is handled by the component itself
 */
export async function takePaymentProof(source: 'camera' | 'gallery'): Promise<PhotoResult | null> {
    if (source === 'camera') {
        return takePhoto();
    } else {
        return pickFromGallery();
    }
}

/**
 * Check if camera is available on this platform
 */
export function isCameraAvailable(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Request camera permissions (if needed)
 * Note: Capacitor handles permissions automatically on first use
 */
export async function requestCameraPermissions(): Promise<boolean> {
    const CameraPlugin = await loadCameraPlugin();
    if (!CameraPlugin) return false;

    try {
        const { checkPermissions, requestPermissions } = await import('@capacitor/camera');

        const permissions = await CameraPlugin.checkPermissions();

        if (permissions.camera === 'granted' && permissions.photos === 'granted') {
            return true;
        }

        const result = await CameraPlugin.requestPermissions();
        return result.camera === 'granted' || result.photos === 'granted';
    } catch (error) {
        console.error('Error requesting camera permissions:', error);
        return false;
    }
}
