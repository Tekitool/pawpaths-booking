import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Security: Prevent execution in production unless secret is provided
    if (process.env.NODE_ENV !== 'development' && secret !== 'pawpaths-secure-seed-2025') {
        return NextResponse.json(
            { error: 'Forbidden: This route is only available in development mode or with a valid secret.' },
            { status: 403 }
        );
    }

    try {
        await dbConnect();

        // Users data
        const usersToSeed = [
            {
                name: 'Hashif Haneef',
                email: 'hashif@pawpathsae.com',
                password: 'ppadmin',
                role: 'admin',
                status: 'Active',
                joined: '2020-01-01',
            },
            {
                name: 'Shafeeq Abdulla',
                email: 'shafeeq@pawpathsae.com',
                password: 'ppadmin',
                role: 'admin',
                status: 'Active',
                joined: '2020-01-04',
            },
            {
                name: 'Suhail',
                email: 'suhail@pawpathsae.com',
                password: 'ppuser',
                role: 'staff',
                status: 'Active',
                joined: '2021-05-21',
            },
            {
                name: 'Sana',
                email: 'sana@pawpathsae.com',
                password: 'ppuser',
                role: 'staff',
                status: 'Active',
                joined: '2020-02-11',
            },
            {
                name: 'Ansar KC',
                email: 'tekitools@gmail.com',
                password: 'ppadmin',
                role: 'customer',
                status: 'Active',
                joined: '2020-01-01',
            },
        ];

        // Delete existing users
        await User.deleteMany({});

        // Create new users
        for (const user of usersToSeed) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await User.create({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                isActive: user.status === 'Active',
                createdAt: new Date(user.joined),
                updatedAt: new Date(user.joined), // Set updated same as created for consistency
            });
        }

        return NextResponse.json({ message: 'Users seeded successfully', count: usersToSeed.length });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
