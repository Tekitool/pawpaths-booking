import type { Metadata } from 'next';
import Link from 'next/link';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowRight,
    MessageCircle,
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Send,
} from 'lucide-react';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: 'Contact Us | Pawpaths',
    description:
        'Get in touch with Pawpaths — UAE\'s premium pet relocation service. Visit our Dubai office, call, WhatsApp, or start an enquiry online.',
    alternates: { canonical: 'https://pawpathsae.com/contact' },
    openGraph: {
        title: 'Contact Pawpaths | Pet Relocation UAE',
        description:
            'Reach our Dubai team by phone, WhatsApp, or email. Office at Arjumand Business Center, Dubai Investment Park.',
        url: 'https://pawpathsae.com/contact',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT_CARDS = [
    {
        icon: MapPin,
        label: 'Our Office',
        lines: [
            'Office No. 204,',
            'Arjumand Business Center,',
            'Dubai Investment Park - 1,',
            'Jebel Ali, Dubai, UAE',
        ],
        action: {
            text: 'Get Directions',
            href: 'https://maps.google.com/?q=Arjumand+Business+Center+Dubai+Investment+Park+1+Jebel+Ali+Dubai',
            external: true,
        },
        color: 'bg-brand-brown/8 text-brand-brown',
        border: 'border-brand-brown/12',
    },
    {
        icon: Phone,
        label: 'Phone & WhatsApp',
        lines: ['+971 58 694 7755'],
        action: {
            text: 'WhatsApp Us',
            href: 'https://wa.me/971586947755',
            external: true,
        },
        color: 'bg-success/8 text-success',
        border: 'border-success/12',
    },
    {
        icon: Mail,
        label: 'Email',
        lines: ['info@pawpathsae.com'],
        action: {
            text: 'Send Email',
            href: 'mailto:info@pawpathsae.com',
            external: false,
        },
        color: 'bg-brand-amber/8 text-brand-amber',
        border: 'border-brand-amber/12',
    },
    {
        icon: Clock,
        label: 'Working Hours',
        lines: ['Mon – Sat  8:00 AM – 9:00 PM', 'Sunday  8:00 AM – 9:00 PM', 'GST (UTC +4)'],
        action: {
            text: 'Book an Appointment',
            href: '/enquiry',
            external: false,
        },
        color: 'bg-brand-yellow/12 text-brand-brown',
        border: 'border-brand-yellow/20',
    },
];

const SOCIAL_LINKS = [
    {
        icon: MessageCircle,
        label: 'WhatsApp',
        href: 'https://wa.me/971586947755',
        bg: 'bg-[#25D366]',
    },
    {
        icon: Instagram,
        label: 'Instagram',
        href: 'https://instagram.com/pawpathsae',
        bg: 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    },
    {
        icon: Facebook,
        label: 'Facebook',
        href: 'https://facebook.com/pawpathsae',
        bg: 'bg-[#1877F2]',
    },
    {
        icon: Youtube,
        label: 'YouTube',
        href: '#',
        bg: 'bg-[#FF0000]',
    },
    {
        icon: Twitter,
        label: 'X / Twitter',
        href: 'https://twitter.com/pawpathsae',
        bg: 'bg-[#000000]',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-surface-ivory">

            {/* ── NAVBAR ──────────────────────────────────────────────── */}
            <NavBar />

            <main className="flex-1">

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="relative bg-brand-brown overflow-hidden pt-20 pb-20 px-4 sm:px-6 lg:px-8">
                    {/* Background glows */}
                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-amber/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-yellow/8 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/70 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            <Send size={11} />
                            We respond within 24 hours
                        </span>

                        <h1
                            className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            Get in{' '}
                            <span className="text-brand-yellow">Touch</span>
                        </h1>

                        <p className="text-white/65 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                            Have a question about relocating your pet? Our Dubai team is ready to
                            help — by phone, WhatsApp, email, or in person.
                        </p>
                    </div>
                </section>

                {/* ── CONTACT CARDS ────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                        {CONTACT_CARDS.map(({ icon: Icon, label, lines, action, color, border }) => (
                            <div
                                key={label}
                                className={`bg-white rounded-2xl border ${border} p-6 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4`}
                            >
                                {/* Icon */}
                                <div className={`w-11 h-11 rounded-xl ${color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                    <Icon size={20} />
                                </div>

                                {/* Label + lines */}
                                <div className="flex-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-brand-taupe/60 mb-2">
                                        {label}
                                    </p>
                                    {lines.map((line) => (
                                        <p key={line} className="text-brand-brown text-sm font-medium leading-snug">
                                            {line}
                                        </p>
                                    ))}
                                </div>

                                {/* Action link */}
                                {action.external ? (
                                    <a
                                        href={action.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-amber hover:text-brand-amber-light transition-colors"
                                    >
                                        {action.text} <ArrowRight size={12} />
                                    </a>
                                ) : (
                                    <Link
                                        href={action.href}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-amber hover:text-brand-amber-light transition-colors"
                                    >
                                        {action.text} <ArrowRight size={12} />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── MAP + ENQUIRY SPLIT ───────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

                        {/* Map — takes 3/5 on desktop */}
                        <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-brand-taupe/10 shadow-soft min-h-[360px] lg:min-h-[460px]">
                            <iframe
                                title="Pawpaths Office Location — Dubai Investment Park"
                                src="https://www.openstreetmap.org/export/embed.html?bbox=55.1421%2C24.9764%2C55.1921%2C25.0164&layer=mapnik&marker=24.9964%2C55.1621"
                                className="w-full h-full min-h-[360px] lg:min-h-[460px] border-0"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>

                        {/* Right panel — takes 2/5 */}
                        <div className="lg:col-span-2 flex flex-col gap-5">

                            {/* Address card */}
                            <div className="bg-brand-brown rounded-2xl p-7 text-white flex-1 relative overflow-hidden">
                                <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl" />
                                <div aria-hidden className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-yellow/8 rounded-full blur-xl" />

                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                                        <MapPin size={18} className="text-brand-yellow" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                                        Find Us Here
                                    </p>
                                    <p className="text-white font-semibold text-base leading-relaxed mb-1">
                                        Office No. 204
                                    </p>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Arjumand Business Center,<br />
                                        Dubai Investment Park - 1,<br />
                                        Jebel Ali, Dubai, UAE
                                    </p>

                                    <a
                                        href="https://maps.google.com/?q=Arjumand+Business+Center+Dubai+Investment+Park+1+Jebel+Ali+Dubai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-6 bg-brand-amber text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-amber-light transition-colors"
                                    >
                                        <MapPin size={13} /> Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Start enquiry card */}
                            <div className="bg-white border border-brand-amber/20 rounded-2xl p-7 flex flex-col gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-amber/10 flex items-center justify-center">
                                    <Send size={18} className="text-brand-amber" />
                                </div>
                                <div>
                                    <h3
                                        className="text-brand-brown font-bold text-lg mb-1"
                                        style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                    >
                                        Ready to Start?
                                    </h3>
                                    <p className="text-brand-taupe text-sm leading-relaxed">
                                        Fill out our simple enquiry form and our team will craft
                                        a personalised relocation plan for your pet.
                                    </p>
                                </div>
                                <Link
                                    href="/enquiry"
                                    className="flex items-center justify-center gap-2 bg-brand-brown text-white font-semibold text-sm py-3 rounded-xl hover:bg-brand-brown-light transition-colors shadow-soft"
                                >
                                    Start Your Enquiry <ArrowRight size={15} />
                                </Link>
                                <a
                                    href="https://wa.me/971586947755"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#1a9e4e] font-semibold text-sm py-3 rounded-xl hover:bg-[#25D366]/8 transition-colors"
                                >
                                    <MessageCircle size={15} /> WhatsApp Chat
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SOCIAL & FAQ STRIP ────────────────────────────────── */}
                <section className="bg-brand-cream py-14 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2
                            className="text-brand-brown text-2xl sm:text-3xl font-bold mb-2"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            Connect With Us
                        </h2>
                        <p className="text-brand-taupe text-sm mb-8 max-w-md mx-auto">
                            Follow along for pet travel tips, relocation stories, and UAE pet news.
                        </p>

                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {SOCIAL_LINKS.map(({ icon: Icon, label, href, bg }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className={`${bg} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-soft hover:scale-110 hover:shadow-medium transition-all duration-200`}
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ TEASER CTA ────────────────────────────────────── */}
                <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <p className="text-brand-taupe text-sm mb-3">Looking for quick answers?</p>
                    <h2
                        className="text-brand-brown text-2xl sm:text-3xl font-bold mb-6"
                        style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                    >
                        Common questions about pet relocation
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
                        {[
                            'What documents does my pet need to fly from the UAE?',
                            'How long does the relocation process take?',
                            'Which airlines accept pets as cargo from Dubai?',
                            'Do you handle snub-nosed (brachycephalic) breeds?',
                        ].map((q) => (
                            <div
                                key={q}
                                className="bg-white border border-brand-taupe/10 rounded-xl px-5 py-4 text-sm text-brand-taupe shadow-soft"
                            >
                                {q}
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/enquiry"
                        className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-brand-amber-light transition-colors shadow-soft text-sm"
                    >
                        Ask Us Directly <ArrowRight size={15} />
                    </Link>
                </section>

            </main>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <Footer />

        </div>
    );
}
