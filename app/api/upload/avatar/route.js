import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const { uploadFile } = await import('@/lib/storage-service');

        const { url, filename } = await uploadFile(file, 'users');

        return NextResponse.json({
            success: true,
            path: url
        });
    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
