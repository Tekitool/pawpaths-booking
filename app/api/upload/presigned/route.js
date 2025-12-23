import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/auth';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { filename, contentType, folder = 'uploads' } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Filename and content type are required' }, { status: 400 });
        }

        const uniqueFilename = `${uuidv4()}-${filename.replace(/\s+/g, '-')}`;
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
