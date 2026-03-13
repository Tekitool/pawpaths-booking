'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, ArrowUp, Loader2, CheckCircle2, AlertCircle, Info as InfoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNewsletter } from '@/app/actions/subscribe';

const PAYMENT_LOGOS = [
    { src: '/logos/Visa.svg', alt: 'Visa' },
    { src: '/logos/MasterCard.svg', alt: 'Mastercard' },
    { src: '/logos/Tabby.svg', alt: 'Tabby' },
    { src: '/logos/Tamara.svg', alt: 'Tamara' },
    { src: '/logos/Pemo.svg', alt: 'Pemo' },
    { src: '/logos/PayPal.svg', alt: 'PayPal' },
];

export default function Footer() {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'info' | 'error', message: string } | null>(null);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Auto-clear success message after 5 seconds
    useEffect(() => {
        if (status?.type === 'success') {
            const timer = setTimeout(() => setStatus(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus(null);
        setIsSubscribing(true);

        try {
            const result = await subscribeToNewsletter(email);

            if (result.success) {
                setStatus({ type: 'success', message: result.message });
                setEmail('');
            } else {
                setStatus({
                    type: result.message.includes('already') ? 'info' : 'error',
                    message: result.message
                });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: "Failed to connect to the server. Please try again."
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <footer className="w-full bg-[#4D2A00] text-white pt-16 mt-auto font-sans relative">
            {/* Extruded Logo Circle */}
            <Link
                href="/"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-12 z-20 group"
            >
                {/* Rotating Glow Effect */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-color-04 via-brand-color-03 to-brand-color-04 opacity-30 blur-md group-hover:opacity-60 transition-all duration-500 animate-[spin_4s_linear_infinite]" />

                {/* Logo Container */}
                <div className="relative w-24 h-24 rounded-full p-1.5 bg-white/40 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,189,0,0.5)]">
                    <div
                        className="w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-inner bg-white overflow-hidden"
                    >
                        {/* Logo Image */}
                        <Image
                            src="/ppicon.svg"
                            alt="Pawpaths Logo"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-6"
                        />
                    </div>
                </div>
            </Link>
            {/* ── MAIN 4-COLUMN GRID AREA ──────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">

                {/* COLUMN 1: Company Info */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Logo Area */}
                    <div className="mb-6">
                        <Link href="/">
                            <Image
                                src="/pplogo-white.svg"
                                alt="Pawpaths Logo"
                                width={144}
                                height={48}
                                className="w-auto h-10 sm:h-12 object-contain"
                            />
                        </Link>
                    </div>

                    <div className="text-sm text-white/80 space-y-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                        <p className="leading-relaxed">
                            Office No. 204,<br />
                            Arjumand Business Center,<br />
                            Dubai Investment Park - 1,<br />
                            Jebel Ali, Dubai
                        </p>

                        <p>
                            <span className="font-bold text-white">Contact : </span>
                            +971586947755
                        </p>

                        <p>
                            <span className="font-bold text-white">Email : </span>
                            <a href="mailto:info@pawpathsae.com" className="hover:text-[#F6B500] transition-colors">info@pawpathsae.com</a>
                        </p>
                    </div>

                    <div>
                        <p className="font-bold text-white mb-3 text-sm">Follow Us On:</p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F6B500] hover:text-[#4D2A00] transition-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg></a>
                            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F6B500] hover:text-[#4D2A00] transition-all"><Facebook size={18} fill="currentColor" strokeWidth={0} /></a>
                            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F6B500] hover:text-[#4D2A00] transition-all"><Instagram size={18} /></a>
                            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F6B500] hover:text-[#4D2A00] transition-all"><Youtube size={20} fill="currentColor" strokeWidth={0} /></a>
                            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F6B500] hover:text-[#4D2A00] transition-all"><Twitter size={18} fill="currentColor" strokeWidth={0} /></a>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Explore */}
                <div className="lg:col-span-3 flex flex-col pt-2 md:pl-8 lg:pl-12">
                    <h4 className="font-bold text-xl text-white mb-2 tracking-wide" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>Explore</h4>
                    <div className="w-8 h-[3px] bg-[#F6B500] mb-6 rounded-full" />

                    <ul className="space-y-4 text-sm text-white/80" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                        {[
                            { name: 'Contact', href: '/contact' },
                            { name: 'Services', href: '/services' },
                            { name: 'Products', href: '/products' },
                            { name: 'Tools', href: '/tools' },
                            { name: 'Blogs', href: '#' },
                            { name: 'Gallery', href: '#' },
                        ].map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="hover:text-[#F6B500] transition-colors block">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COLUMN 3: Quick Links */}
                <div className="lg:col-span-3 flex flex-col pt-2 lg:pl-8">
                    <h4 className="font-bold text-xl text-white mb-2 tracking-wide" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>Quick Links</h4>
                    <div className="w-8 h-[3px] bg-[#F6B500] mb-6 rounded-full" />

                    <ul className="space-y-4 text-sm text-white/80" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                        {[
                            { name: 'Customer FAQ', href: '#' },
                            { name: 'Terms And Conditions', href: '#' },
                            { name: 'Terms of Service', href: '/terms-of-service' },
                            { name: 'Shipping & Return', href: '#' },
                            { name: 'Payment & Refund', href: '#' },
                            { name: 'Privacy Policy', href: '/privacy-policy' },
                        ].map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="hover:text-[#F6B500] transition-colors block">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COLUMN 4: Newsletter */}
                <div className="lg:col-span-3 flex flex-col">
                    <div className="w-full bg-[#2E1800] rounded-2xl border border-[#F6B500]/30 p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden h-[340px] justify-start pt-8 pb-4">
                        {/* Decorative Top Left Glow */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F6B500]/5 rounded-full blur-[30px]" />

                        <h4 className="font-bold text-lg sm:text-xl text-white text-center mb-1 leading-tight" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Subscribe to our<br />newsletter
                        </h4>

                        {/* Little Paw Icon Deco */}
                        <div className="mb-4 mt-1">
                            <Image
                                src="/icon-paw2.svg"
                                alt="Paw Icon"
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain opacity-80"
                            />
                        </div>

                        <form className="w-full flex flex-col gap-3 relative z-10" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Type Your E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 bg-[#FFFBEA] rounded-md px-4 text-sm text-[#4D2A00] placeholder:text-[#4D2A00]/60 focus:outline-none focus:ring-2 focus:ring-[#F6B500] disabled:opacity-70"
                                required
                                disabled={isSubscribing}
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="w-full h-11 bg-gradient-to-r from-[#F6A33B] to-[#F18D23] hover:from-[#F18D23] hover:to-[#E67D13] text-[#4D2A00] font-bold text-sm rounded-md transition-colors shadow-md flex items-center justify-center gap-2 group disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                {isSubscribing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-[#4D2A00]" />
                                        Subscribing...
                                    </>
                                ) : (
                                    'Subscribe Now'
                                )}
                            </button>
                        </form>

                        {/* Modern Static-Height Status Feedback */}
                        <div className="w-full relative mt-4">
                            <AnimatePresence mode="wait">
                                {status && (
                                    <motion.div
                                        key={status.type}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`
                                            flex flex-col items-center justify-center text-center gap-1 p-3 rounded-xl border text-xs sm:text-sm font-medium w-full
                                            ${status.type === 'success' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}
                                        `}
                                    >
                                        {status.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 mb-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 mb-0.5" />
                                        )}
                                        <span className="leading-tight">{status.message}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── BOTTOM COPYRIGHT BAR ────────────────────────────────────────── */}
            <div className="w-full bg-[#26160C] border-t border-white/5 relative">
                <div
                    className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-y-3 gap-x-6"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                    {/* Left — copyright */}
                    <p className="text-[11px] sm:text-[13px] text-white/50 tracking-wide text-center sm:text-left shrink-0">
                        Copyright &copy; Pawpaths 2026 | Powered by{' '}
                        <a
                            href="https://tekitool.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F6B500] hover:text-white transition-colors"
                        >
                            tekitool.com
                        </a>
                        {' '}|{' '}
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        {' '}|{' '}
                        <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                    </p>

                    {/* Right — payment logos */}
                    <div className="flex items-center gap-1 pr-12 sm:pr-14">
                        {PAYMENT_LOGOS.map(({ src, alt }) => (
                            <Image
                                key={alt}
                                src={src}
                                alt={alt}
                                width={44}
                                height={22}
                                className="h-4 sm:h-5 w-auto object-contain"
                                unoptimized
                            />
                        ))}
                    </div>
                </div>

                {/* Back to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="absolute right-4 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#F6921E] hover:bg-[#E67D13] rounded flex items-center justify-center text-white transition-colors shadow-lg group"
                    aria-label="Scroll to top"
                >
                    <ArrowUp strokeWidth={2.5} className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </footer>
    );
}
