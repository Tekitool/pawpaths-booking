import { supabase } from '@/lib/supabase/client'; // Using existing client path

export const STORAGE_BUCKETS = {
    PHOTOS: 'photos',
    AVATARS: 'avatars',
    MEDIA: 'media',
    DOCUMENTS: 'documents',
};

export async function uploadFile({ file, bucket, folder }) {
    try {
        // 1. Sanitize Filename
        // Remove special chars, spaces, and add timestamp to prevent duplicates
        const fileExt = file.name.split('.').pop().toLowerCase();
        const nameStem = file.name.substring(0, file.name.lastIndexOf('.'));
        // Sanitize stem only to avoid 'filenamejpg.jpg'
        const cleanStem = nameStem.replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `${Date.now()}-${cleanStem}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // 2. Upload
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type // Ensure correct MIME type is stored
            });

        if (error) throw error;

        // 3. Return the clean path
        return data.path;

    } catch (error) {
        console.error('Upload failed:', error.message);
        throw error; // Re-throw so the UI can show an alert
    }
}

export function getPublicUrl(bucket, path) {
    if (!path) return ''; // Prevent crashes if path is missing
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

export async function getSecureDocumentUrl(path, options = { download: false }) {
    if (!path) return '';
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .createSignedUrl(path, 3600, options); // 1 hour validity

    if (error) {
        console.error('Error signing URL:', error);
        return null;
    }
    return data.signedUrl;
}
