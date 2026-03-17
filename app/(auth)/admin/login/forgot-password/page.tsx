/**
 * Admin forgot-password — served at URL: /admin/login/forgot-password
 * Middleware passes /admin/login/* through without auth checks.
 * Re-exports the base forgot-password page so the route resolves correctly.
 */
export { default } from '@/app/login/forgot-password/page';
