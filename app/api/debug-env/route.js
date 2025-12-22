import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasAuthSecret: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET ? process.env.AUTH_SECRET.length : 0,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI
    });
}
