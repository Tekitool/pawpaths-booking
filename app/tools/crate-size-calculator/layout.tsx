import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "IATA Dog Crate Calculator 2026 | Avoid Airline Rejection - Pawpaths",
    description: "Will your pet's crate fly? Calculate exact IATA-compliant dimensions instantly. Check rules for Snub-nosed breeds, Emirates, Qatar Airways, and more. 100% Free Tool.",
    keywords: [
        "IATA crate calculator",
        "dog travel kennel size",
        "airline pet cargo rules 2026",
        "sky kennel dimensions",
        "cat carrier size guide",
        "live animals regulations",
        "snub-nose dog crate",
        "pet relocation UAE",
        "Emirates SkyCargo pet rules",
        "Qatar Airways pet crate size"
    ],
    openGraph: {
        title: "Will your pet's crate be rejected? Check instantly.",
        description: "Don't guess. Calculate the exact IATA-compliant crate size for your pet's flight.",
        url: "https://booking.pawpathsae.com/tools/crate-size-calculator",
        siteName: "Pawpaths Logistics Tools",
        type: "website",
        locale: "en_AE",
        images: [
            {
                url: "/images/og-crate-calculator.jpg",
                width: 1200,
                height: 630,
                alt: "IATA Pet Crate Measurement Guide",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "IATA Dog Crate Calculator 2026 | Pawpaths",
        description: "Avoid airport rejection. Calculate IATA-compliant pet crate sizes in seconds.",
    },
    alternates: {
        canonical: "https://booking.pawpathsae.com/tools/crate-size-calculator",
    },
};

export default function CrateSizeCalculatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
