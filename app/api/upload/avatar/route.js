import { NextResponse } from 'next/server';
import { uploadAvatarToSupabase } from '@/lib/storage-service';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const { url } = await uploadAvatarToSupabase(file);

        return NextResponse.json({ success: true, path: url });
    } catch (error) {
        console.error('Avatar upload failed:', error);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
