import { supabase } from '@/lib/supabase/client'; // Using existing client path

export const STORAGE_BUCKETS = {
    PHOTOS: 'photos',
    AVATARS: 'avatars',
    MEDIA: 'media',
    DOCUMENTS: 'documents',
    PUBLIC_ASSETS: 'public_assets',
};

// ── Upload constraints ──────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Extension → allowed MIME types mapping.
// Both the extension AND the MIME type must match (no OR logic).
const ALLOWED_FILE_MAP = {
    jpg:  ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png:  ['image/png'],
    pdf:  ['application/pdf'],
    webp: ['image/webp'],
};

// Magic-byte signatures for MIME sniffing (first N bytes of the file).
const MAGIC_BYTES = {
    'image/jpeg': [
        [0xFF, 0xD8, 0xFF],                          // JFIF / Exif
    ],
    'image/png': [
        [0x89, 0x50, 0x4E, 0x47],                    // PNG header
    ],
    'application/pdf': [
        [0x25, 0x50, 0x44, 0x46],                    // %PDF
    ],
    'image/webp': [
        // RIFF????WEBP — bytes 0-3 = RIFF, bytes 8-11 = WEBP
        // We check the RIFF prefix here; WEBP at offset 8 is checked separately.
        [0x52, 0x49, 0x46, 0x46],
    ],
};

/**
 * Validate file before upload — enforces size, extension, MIME type,
 * and magic-byte sniffing to prevent disguised malicious uploads.
 */
function validateFile(file) {
    // 1. Size check
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 5 MB.`
        );
    }

    // 2. Extract and validate extension
    const nameParts = file.name.split('.');
    if (nameParts.length < 2) {
        throw new Error('File must have a valid extension (e.g. .jpg, .png, .pdf).');
    }
    const ext = nameParts.pop().toLowerCase();

    if (!ALLOWED_FILE_MAP[ext]) {
        throw new Error(
            `File extension ".${ext}" is not allowed. Accepted: ${Object.keys(ALLOWED_FILE_MAP).join(', ')}.`
        );
    }

    // 3. MIME type must match extension (prevents extension spoofing)
    const allowedMimes = ALLOWED_FILE_MAP[ext];
    if (!allowedMimes.includes(file.type)) {
        throw new Error(
            `File type "${file.type}" does not match extension ".${ext}".`
        );
    }
}

/**
 * Sniff magic bytes from a File/Blob to verify the actual content matches
 * the declared MIME type. Returns true if the file's leading bytes match
 * at least one known signature for the declared type.
 */
async function verifyMagicBytes(file) {
    const signatures = MAGIC_BYTES[file.type];
    if (!signatures) return; // No signature to check (allow through)

    const headerSize = Math.max(...signatures.map(s => s.length));
    const buffer = await file.slice(0, Math.max(headerSize, 12)).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const matched = signatures.some(sig =>
        sig.every((byte, i) => bytes[i] === byte)
    );

    if (!matched) {
        throw new Error(
            'File content does not match its declared type. The file may be corrupted or disguised.'
        );
    }

    // Extra check for WebP: bytes 8-11 must be "WEBP"
    if (file.type === 'image/webp') {
        const webpMark = [0x57, 0x45, 0x42, 0x50]; // W E B P
        const isWebp = webpMark.every((b, i) => bytes[8 + i] === b);
        if (!isWebp) {
            throw new Error('File declares WebP but content is a different RIFF format.');
        }
    }
}

export async function uploadFile({ file, bucket, folder }) {
    // ── Validation (runs before any network call) ────────────────────────
    validateFile(file);
    await verifyMagicBytes(file);

    try {
        // 1. Sanitize Filename
        const fileExt = file.name.split('.').pop().toLowerCase();
        const nameStem = file.name.substring(0, file.name.lastIndexOf('.'));
        const cleanStem = nameStem.replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `${Date.now()}-${cleanStem}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // 2. Upload
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
            });

        if (error) throw error;

        // 3. Return the clean path
        return data.path;

    } catch (error) {
        console.error('Upload failed:', error.message);
        throw error;
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
