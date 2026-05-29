// Storage Service - Handles Supabase Storage operations for payment proofs

import { supabase } from '@/lib/supabase';

/**
 * Upload a payment proof to Supabase Storage
 * 
 * @param userId - UUID of the user
 * @param enrollmentId - ID of the enrollment
 * @param base64Image - Base64-encoded image string
 * @param format - Image format (jpg, png, etc.)
 * @returns Public URL of the uploaded file
 */
export async function uploadPaymentProof(
    userId: string,
    enrollmentId: number,
    base64Image: string,
    format: string = 'jpg'
): Promise<string> {
    try {
        // Convert base64 to blob
        const byteString = atob(base64Image);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: `image/${format}` });

        // Generate filename: {enrollment_id}_{timestamp}.{format}
        const timestamp = Date.now();
        const filename = `${enrollmentId}_${timestamp}.${format}`;
        const filePath = `${userId}/${filename}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, blob, {
                contentType: `image/${format}`,
                upsert: false, // Don't overwrite existing files
            });

        if (error) {
            console.error('Error uploading to Storage:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        console.log('Payment proof uploaded successfully:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Error in uploadPaymentProof:', error);
        throw error;
    }
}

/**
 * Delete a payment proof from Storage
 * 
 * @param url - Public URL of the file to delete
 * @returns true if successful
 */
export async function deletePaymentProof(url: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const urlParts = url.split('/payment-proofs/');
        if (urlParts.length < 2) {
            throw new Error('Invalid payment proof URL');
        }
        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('payment-proofs')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting from Storage:', error);
            throw new Error(`Delete failed: ${error.message}`);
        }

        console.log('Payment proof deleted successfully');
        return true;
    } catch (error) {
        console.error('Error in deletePaymentProof:', error);
        throw error;
    }
}

/**
 * Get a signed URL for a payment proof (for private buckets)
 * Note: Currently the bucket is private, so this might be needed
 * 
 * @param filePath - Path to the file in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedPaymentProofUrl(
    filePath: string,
    expiresIn: number = 3600
): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error('Error generating signed URL:', error);
            throw new Error(`Signed URL generation failed: ${error.message}`);
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Error in getSignedPaymentProofUrl:', error);
        throw error;
    }
}

/**
 * Update enrollment record with payment proof URL
 * 
 * @param enrollmentId - ID of the enrollment
 * @param proofUrl - URL of the uploaded payment proof
 * @returns true if successful
 */
export async function updateEnrollmentPaymentProof(
    enrollmentId: number,
    proofUrl: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('inscricoes_modalidades')
            .update({
                payment_proof_url: proofUrl,
                payment_proof_uploaded_at: new Date().toISOString(),
            })
            .eq('id', enrollmentId);

        if (error) {
            console.error('Error updating enrollment:', error);
            throw new Error(`Database update failed: ${error.message}`);
        }

        console.log('Enrollment updated with payment proof URL');
        return true;
    } catch (error) {
        console.error('Error in updateEnrollmentPaymentProof:', error);
        throw error;
    }
}

/**
 * Validate file size before upload
 * 
 * @param base64String - Base64-encoded image
 * @param maxSizeMB - Maximum size in megabytes (default: 5MB)
 * @returns true if valid, false otherwise
 */
export function validateFileSize(base64String: string, maxSizeMB: number = 5): boolean {
    // Calculate size from base64 string
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    console.log(`File size: ${sizeInMB.toFixed(2)} MB`);

    return sizeInMB <= maxSizeMB;
}

/**
 * Upload an event payment proof to Supabase Storage
 * 
 * @param userId - UUID of the user
 * @param eventId - UUID of the event
 * @param base64Image - Base64-encoded image string
 * @param format - Image format (jpg, png, etc.)
 * @returns Public URL of the uploaded file
 */
export async function uploadEventPaymentProof(
    userId: string,
    eventId: string,
    base64Image: string,
    format: string = 'jpg'
): Promise<string> {
    try {
        // Convert base64 to blob
        const byteString = atob(base64Image);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: `image/${format}` });

        // Generate filename: event_{eventId}_{timestamp}.{format}
        const timestamp = Date.now();
        const filename = `event_${eventId}_${timestamp}.${format}`;
        const filePath = `${userId}/${filename}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, blob, {
                contentType: `image/${format}`,
                upsert: false,
            });

        if (error) {
            console.error('Error uploading to Storage:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        console.log('Event payment proof uploaded successfully:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Error in uploadEventPaymentProof:', error);
        throw error;
    }
}
