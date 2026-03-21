import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logAuditAction } from '@/lib/audit-logger';

/** Only these folder values are accepted — prevents path traversal */
const ALLOWED_FOLDERS = ['uploads', 'documents', 'photos'];

/** Only these MIME types may be uploaded via presigned URL */
const ALLOWED_CONTENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
];

/** Roles permitted to generate presigned upload URLs */
const UPLOAD_ROLES = ['super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance', 'driver', 'staff'];

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check — only staff may generate presigned URLs
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !UPLOAD_ROLES.includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { filename, contentType, folder = 'uploads' } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Filename and content type are required' }, { status: 400 });
        }

        // Whitelist folder to prevent path traversal
        if (!ALLOWED_FOLDERS.includes(folder)) {
            return NextResponse.json(
                { error: `Invalid folder. Must be one of: ${ALLOWED_FOLDERS.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate MIME type against allowlist
        if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
            return NextResponse.json(
                { error: 'Invalid content type. Allowed: PDF, JPG, PNG.' },
                { status: 400 }
            );
        }

        // Strip whitespace, path separators, and traversal sequences to prevent path injection.
        const safeFilename = filename
            .replace(/\s+/g, '-')
            .replace(/[/\\]/g, '')
            .replace(/\.\./g, '');
        const uniqueFilename = `${uuidv4()}-${safeFilename}`;
        const key = `${folder}/${uniqueFilename}`;
        const bucketName = process.env.AWS_BUCKET_NAME;

        if (!bucketName) {
            return NextResponse.json({ error: 'AWS_BUCKET_NAME is not configured' }, { status: 500 });
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Audit every presigned URL request
        await logAuditAction(
            supabase,
            'storage',
            key,
            'CREATE',
            `Presigned upload URL generated: ${key}`,
            { userId: user.id, role: profile.role, folder, filename, contentType }
        );

        return NextResponse.json({
            uploadUrl,
            key,
            url: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
        });
    } catch (error) {
        console.error('Presigned URL generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
