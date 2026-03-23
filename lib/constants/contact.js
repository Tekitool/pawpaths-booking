/**
 * Company contact details — single source of truth.
 *
 * Reads from env vars with sensible fallbacks.
 * Usage: import { WHATSAPP_NUMBER, COMPANY_PHONE_DISPLAY, buildWhatsAppUrl } from '@/lib/constants/contact';
 */

// Raw digits for wa.me links (no leading +)
export const WHATSAPP_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971586947755';

// Formatted for display (with spaces)
export const COMPANY_PHONE_DISPLAY =
    process.env.NEXT_PUBLIC_COMPANY_PHONE_DISPLAY || '+971 58 694 7755';

/**
 * Build a WhatsApp click-to-chat URL.
 * @param {string} [message] — optional pre-filled message (will be URI-encoded)
 */
export function buildWhatsAppUrl(message) {
    const base = `https://wa.me/${WHATSAPP_NUMBER}`;
    if (!message) return base;
    return `${base}?text=${encodeURIComponent(message)}`;
}
