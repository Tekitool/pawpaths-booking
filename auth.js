import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import dbConnect from './lib/mongodb';
import User from './lib/models/User';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET || 'bbcbfefbbd95dc619c2fe6bb0b9a78295d40caa712d5584651b24196dc5e5410',
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    await dbConnect();
                    const user = await User.findOne({ email: credentials.email }).select('+password');

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
                    if (passwordsMatch) return user;

                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
});
