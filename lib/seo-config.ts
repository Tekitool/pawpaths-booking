// app/(homepage)/lib/seo-config.ts
// Centralized SEO configuration for Pawpaths homepage

export const siteConfig = {
  name: "Pawpaths",
  legalName: "Tekitool Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pawpathsae.com",
  description: "Expert international pet relocation services in the UAE. AI-powered tools for stress-free dog and cat transport from Dubai, Abu Dhabi, and beyond.",
  
  // Contact
  email: "info@pawpathsae.com",
  
  // Location
  address: {
    streetAddress: "",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  
  // Geo coordinates (Dubai)
  geo: {
    latitude: 25.276987,
    longitude: 55.296249,
  },
  
  // Service areas
  areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain"],
  
  // Social
  social: {
    instagram: "",
    facebook: "",
    twitter: "",
  },
  
  // Brand colors (for meta theme-color)
  brandColor: "#4D2A00",
  
  // OG Image
  ogImage: "/og-image.jpg",
  ogImageAlt: "Pawpaths - Premium Pet Relocation Services UAE",
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

// Primary keywords for content optimization
export const primaryKeywords = [
  "pet relocation UAE",
  "dog transport Dubai",
  "international pet shipping",
  "cat export UAE",
  "IATA pet crate calculator",
  "pet travel Abu Dhabi",
  "airline pet policy",
];

// Long-tail keywords for voice search / AI optimization
export const longTailKeywords = [
  "how to transport a dog from Dubai internationally",
  "what is the best pet relocation service in UAE",
  "IATA approved crate size for golden retriever",
  "airline embargoes for snub-nosed breeds",
  "pet export requirements from UAE",
  "how much does pet relocation cost in Dubai",
  "can I fly with my cat from Abu Dhabi",
];

// FAQ data for schema and content
export const faqData = [
  {
    question: "What is the best pet relocation service in the UAE?",
    answer: "Pawpaths offers premium, stress-free international pet relocation services across the UAE, including Dubai, Abu Dhabi, Sharjah, and Al Ain. We handle all documentation, airline coordination, and IATA-compliant crate requirements."
  },
  {
    question: "How do I calculate the correct IATA pet crate size?",
    answer: "Use the free Pawpaths AI Crate Size Calculator at pawpathsae.com/tools. Simply enter your pet's measurements (length, height, weight) and our AI determines the exact IATA-compliant crate dimensions required for airline travel."
  },
  {
    question: "Can I transport my dog from Dubai internationally?",
    answer: "Yes. Pawpaths specializes in international dog and cat transport from Dubai to destinations worldwide. We manage export permits, health certificates, airline bookings, and door-to-door delivery."
  },
  {
    question: "What documents are needed for pet export from UAE?",
    answer: "Pet export from the UAE typically requires a valid pet passport, microchip registration, rabies vaccination certificate, health certificate from an approved veterinarian, and export permit from the Ministry of Climate Change. Requirements vary by destination country."
  },
  {
    question: "How much does pet relocation from Dubai cost?",
    answer: "Pet relocation costs vary based on destination, pet size, and required services. Contact Pawpaths for a personalized quote. We offer transparent pricing with no hidden fees."
  },
  {
    question: "Which airlines accept pets from Dubai?",
    answer: "Major airlines accepting pets from Dubai include Emirates, Etihad, Qatar Airways, Lufthansa, and British Airways. Each airline has specific policies for in-cabin pets, checked pets, and cargo transport. Use our airline policy checker tool to verify requirements."
  },
];

// Service schema data
export const servicesData = [
  {
    name: "International Pet Relocation",
    description: "End-to-end pet transport services from UAE to any destination worldwide. Includes documentation, airline coordination, and customs clearance.",
    icon: "globe",
  },
  {
    name: "IATA Crate Sizing",
    description: "AI-powered calculator to determine exact IATA-compliant crate dimensions for your pet's safe airline travel.",
    icon: "box",
  },
  {
    name: "Document Preparation",
    description: "Complete handling of export permits, health certificates, pet passports, and destination country requirements.",
    icon: "file-text",
  },
  {
    name: "Airline Coordination",
    description: "We book and manage all airline arrangements, ensuring your pet travels on pet-friendly routes with proper handling.",
    icon: "plane",
  },
  {
    name: "Embargo Checker",
    description: "Real-time verification of airline temperature embargoes and breed restrictions for snub-nosed pets.",
    icon: "alert-triangle",
  },
  {
    name: "Door-to-Door Delivery",
    description: "Complete transport from your home in the UAE to your pet's final destination anywhere in the world.",
    icon: "home",
  },
];

// Schema generators
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    "name": siteConfig.name,
    "legalName": siteConfig.legalName,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "email": siteConfig.email,
    "logo": `${siteConfig.url}/images/pawpaths-logo.png`,
    "image": `${siteConfig.url}${siteConfig.ogImage}`,
    "address": {
      "@type": "PostalAddress",
      ...siteConfig.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": siteConfig.geo.latitude,
      "longitude": siteConfig.geo.longitude
    },
    "areaServed": siteConfig.areaServed.map(city => ({
      "@type": "City",
      "name": city
    })),
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  };
}

export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateServiceSchema(service: typeof servicesData[0]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": siteConfig.name
    },
    "areaServed": siteConfig.areaServed.map(city => ({
      "@type": "City",
      "name": city
    })),
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": siteConfig.url,
      "serviceLocation": {
        "@type": "Place",
        "address": siteConfig.address
      }
    }
  };
}

// Metadata generator for pages
export function generateMetadata(page: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}) {
  const title = page.title 
    ? `${page.title} | ${siteConfig.name}` 
    : `${siteConfig.name} | Premium Pet Relocation UAE`;
  
  const description = page.description || siteConfig.description;
  const url = `${siteConfig.url}${page.path || ''}`;
  const image = page.image || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: primaryKeywords.join(', '),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    
    openGraph: {
      type: 'website',
      locale: 'en_AE',
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: image,
          width: siteConfig.ogImageWidth,
          height: siteConfig.ogImageHeight,
          alt: siteConfig.ogImageAlt,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
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
  };
}
