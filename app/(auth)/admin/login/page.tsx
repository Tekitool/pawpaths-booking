/**
 * Admin login — served at URL: /admin/login
 * Lives inside app/(auth)/ route group so it does NOT inherit app/admin/layout.js.
 * Middleware explicitly passes this path through without auth checks,
 * preventing the redirect loop: /login → /admin/login → /login → ∞
 */
export { default } from '@/app/login/page';
