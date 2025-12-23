import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = 'public/uploads';

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

/**
 * Uploads a file to the configured storage provider (Local or S3)
 * @param {File} file - The file object from FormData
 * @param {string} folder - The folder to upload to (e.g., 'uploads', 'users')
 * @returns {Promise<{url: string, filename: string}>}
 */
export async function uploadFile(file, folder = 'uploads') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;

    // Determine storage provider based on environment or config
    // Default to local for development, S3 for production if keys are present
    const useS3 = process.env.NODE_ENV === 'production' || (process.env.STORAGE_PROVIDER === 's3' && process.env.AWS_ACCESS_KEY_ID);

    if (useS3) {
        return await uploadToS3(buffer, filename, folder, file.type);
    } else {
        return await uploadToLocal(buffer, filename, folder);
    }
}

async function uploadToLocal(buffer, filename, folder) {
    const uploadDir = path.join(process.cwd(), 'public', folder);

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if directory exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
        url: `/${folder}/${filename}`,
        filename: filename
    };
}

async function uploadToS3(buffer, filename, folder, contentType) {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const key = `${folder}/${filename}`;

    if (!bucketName) {
        throw new Error('AWS_BUCKET_NAME is not defined');
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // ACL: 'public-read', // Uncomment if bucket is not public by default but you want files to be
    });

    try {
        await s3Client.send(command);
        // Return the public URL (assuming standard S3 public access or CloudFront)
        // You might need to adjust this based on your specific S3 setup
        const url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
        return {
            url: url,
            filename: filename
        };
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload file to S3');
    }
}
