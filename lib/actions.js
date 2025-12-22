'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState, formData) {
    try {
        console.log('Attempting sign in for:', formData.get('email'));
        await signIn('credentials', formData, { redirectTo: '/admin/dashboard' });
        console.log('Sign in successful (this might not be reached due to redirect)');
    } catch (error) {
        console.log('Sign in error caught:', error.type || error.message);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return `Error: ${error.message}`;
            }
        }
        throw error;
    }
}
