import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free AI Pet Breed Identifier | Check Airline Travel Eligibility - Pawpaths',
    description: 'Upload a photo of your dog or cat. Our AI instantly identifies the breed and checks for IATA travel restrictions, airline bans, and snub-nosed risks. 100% Free.',
    keywords: [
        'pet breed identifier',
        'airline pet travel check',
        'is my dog banned from flying',
        'IATA crate calculator',
        'cat breed scanner',
        'pet relocation uae'
    ],
    openGraph: {
        title: 'Can your pet fly? Check instantly with AI.',
        description: 'Identify your pet\'s breed and risk status for international travel in seconds.',
        siteName: 'Pawpaths Breed Detective',
        type: 'website',
        images: [
            {
                url: '/og-breed-scanner.png',
                width: 1200,
                height: 630,
                alt: 'Pawpaths Pet Breed Scanner'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Can your pet fly? Check instantly with AI.',
        description: 'Identify your pet\'s breed and risk status for international travel in seconds.',
        images: ['/og-breed-scanner.png']
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://pawpaths.com/tools/pet-breed-scanner'
    }
};
