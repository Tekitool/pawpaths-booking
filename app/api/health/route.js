import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    try {
        // Check DB connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            environment: process.env.NODE_ENV
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
