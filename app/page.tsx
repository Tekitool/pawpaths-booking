import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/components/layouts/NavBar'
import Hero from '@/components/home/Hero'
import About from '@/components/home/About'
import Ribbon from '@/components/layouts/Ribbon'
import Services from '@/components/home/Services'
import Solutions from '@/components/home/Solutions'
import Stats from '@/components/home/Stats'
import Offers from '@/components/home/Offers'
import Footer from '@/components/layouts/Footer'

// ─────────────────────────────────────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pawpathsae.com'
    ),
    title: 'Pawpaths | Premium Pet Relocation & Travel Tools UAE',
    description:
        "Expert international pet relocation services in the UAE. Use our free AI Breed Scanner and IATA Crate Size Calculator to plan your pet's safe flight.",
    keywords:
        'pet relocation UAE, dog transport Dubai, cat travel Abu Dhabi, IATA pet crate calculator, AI breed scanner, international pet shipping, Pawpaths',
    alternates: {
        canonical: 'https://pawpathsae.com',
    },
    openGraph: {
        title: 'Pawpaths | Premium Pet Relocation & Travel Tools UAE',
        description:
            'Expert international pet relocation services in the UAE. Use our free AI Breed Scanner and IATA Crate Size Calculator to plan your perfect journey.',
        url: 'https://pawpathsae.com',
        siteName: 'Pawpaths',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Pawpaths — Premium Pet Relocation UAE',
            },
        ],
        locale: 'en_AE',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pawpaths | Premium Pet Relocation & Travel Tools UAE',
        description:
            'Expert international pet relocation services in the UAE. AI-powered travel tools for safe, stress-free pet transport.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    // telephone and address auto-detection are ENABLED BY DEFAULT in browsers.
    // Do not set formatDetection — adding { telephone: false } would disable them.
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': ['LocalBusiness', 'ProfessionalService'],
            '@id': 'https://pawpathsae.com/#business',
            name: 'Pawpaths',
            legalName: 'Tekitool Solutions',
            description:
                'Premium international pet relocation and export services in the UAE, featuring AI-powered travel tools.',
            url: 'https://pawpathsae.com',
            logo: 'https://pawpathsae.com/pawpaths.svg',
            image: 'https://pawpathsae.com/og-image.jpg',
            email: 'info@pawpathsae.com',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'AE',
                addressRegion: 'Dubai',
                addressLocality: 'Dubai',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: '25.2048',
                longitude: '55.2708',
            },
            areaServed: [
                { '@type': 'City', name: 'Dubai' },
                { '@type': 'City', name: 'Abu Dhabi' },
                { '@type': 'City', name: 'Sharjah' },
                { '@type': 'City', name: 'Al Ain' },
            ],
            sameAs: ['https://pawpathsae.com'],
        },
        {
            '@type': 'Organization',
            '@id': 'https://pawpathsae.com/#organization',
            name: 'Tekitool Solutions',
            url: 'https://pawpathsae.com',
            brand: { '@type': 'Brand', name: 'Pawpaths' },
        },
    ],
}

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is the best pet relocation service in the UAE?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Pawpaths offers premium, stress-free international pet relocation and export services from the UAE, featuring smart AI-powered travel tools including a free IATA Crate Size Calculator and AI Breed Scanner.',
            },
        },
        {
            '@type': 'Question',
            name: 'How do I calculate an IATA pet crate size?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use the free Pawpaths AI Crate Size Calculator at pawpathsae.com/tools/crate-size-calculator to instantly check 2026 airline compliance dimensions for your pet.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I transport my dog from Dubai internationally?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Pawpaths specializes in international dog and cat transport from Dubai, Abu Dhabi, Sharjah, and Al Ain to destinations worldwide. Our team handles all paperwork, health certificates, and airline cargo arrangements.',
            },
        },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER LINKS — href="#" until pages are built
// ─────────────────────────────────────────────────────────────────────────────
const FOOTER_LINKS = [
    'Services',
    'Products',
    'Contact',
    'Terms & Conditions',
    'Privacy Policy',
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Full-page wrapper */}
            {/* Removed the background color from here to let the sections control it */}
            <div className="min-h-screen flex flex-col">

                {/* ── NAVBAR ──────────────────────────────────────────────── */}
                <NavBar />

                {/* ── MAIN ────────────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col items-center justify-start pb-16 sm:pb-24">

                    {/* ── HERO SECTION ─────────────────────────────────────── */}
                    <Hero />

                    {/* ── ABOUT SECTION ────────────────────────────────────── */}
                    <About />

                    {/* ── RIBBON MARQUEE ─────────────────────────────────── */}
                    <Ribbon />

                    {/* ── SERVICES SECTION ─────────────────────────────────── */}
                    <Services />

                    {/* ── SOLUTIONS SECTION ────────────────────────────────── */}
                    <Solutions />

                    {/* ── STATS SECTION ────────────────────────────────────── */}
                    <Stats />

                    {/* ── OFFERS SECTION (Why rely on us?) ─────────────────────── */}
                    <Offers />


                </main>

                {/* ── FOOTER ───────────────────────────────────────────────── */}
                <Footer />

            </div>
        </>
    )
}
