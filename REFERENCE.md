# 📖 PAWPATHS BRAND REFERENCE

> **⚠️ SINGLE SOURCE OF TRUTH**
> All brand elements must be read from this file.
> NEVER hardcode any values in components.

---

## 🏢 Brand Identity

### Business Information
```yaml
name: "Pawpaths"
legal_name: "Pawpaths Pets Relocation Services"
tagline: "The Paw-Fect Journey For Your Pet"
description: "Expert international pet relocation services in the UAE. AI-powered tools for stress-free dog and cat transport from Dubai, Abu Dhabi, and beyond."
short_description: "Your trusted partner for safe, stress-free pet travel across the globe."
founding_year: 2024
industry: "Pet Relocation & Travel Services"
```

### Brand Voice
```yaml
tone: "Professional, warm, trustworthy, innovative"
personality:
  - Caring and compassionate about pets
  - Expert and knowledgeable
  - Modern and tech-forward
  - Reliable and transparent
writing_style:
  - Clear and concise
  - Avoid jargon unless necessary
  - Use active voice
  - Include calls to action
```

---

## 📞 Contact Information

### Primary Contact
```yaml
email: "info@pawpathsae.com"
phone: "+971 XX XXX XXXX"
whatsapp: "+971 XX XXX XXXX"
working_hours: "Sunday - Thursday: 9:00 AM - 6:00 PM GST"
response_time: "Within 24 hours"
```

### Address
```yaml
street: ""
city: "Dubai"
region: "Dubai"
country: "United Arab Emirates"
country_code: "AE"
postal_code: ""
```

### Geo Coordinates (Dubai)
```yaml
latitude: 25.276987
longitude: 55.296249
```

### Service Areas
```yaml
primary:
  - Dubai
  - Abu Dhabi
  - Sharjah
  - Al Ain
extended:
  - Ajman
  - Ras Al Khaimah
  - Fujairah
international: true
```

---

## 🔗 Social Media & Links

### Social Profiles
```yaml
instagram: "https://instagram.com/pawpathsae"
facebook: "https://facebook.com/pawpathsae"
twitter: "https://twitter.com/pawpathsae"
linkedin: "https://linkedin.com/company/pawpaths"
youtube: ""
tiktok: ""
```

### Website URLs
```yaml
main: "https://pawpathsae.com"
tools: "https://pawpathsae.com/tools"
enquiry: "https://pawpathsae.com/enquiry"
admin: "https://admin.pawpathsae.com"
```

---

## 🎨 Color System

### Primary Palette
```yaml
colors:
  primary:
    name: "Pawpath Brown"
    hex: "#4D2A00"
    rgb: "77, 42, 0"
    hsl: "33, 100%, 15%"
    usage: "Headers, CTAs, important text, primary buttons"
    tailwind: "brand-brown"
    
  secondary:
    name: "Pawpath Cream"
    hex: "#FEEEA1"
    rgb: "254, 238, 161"
    hsl: "50, 97%, 81%"
    usage: "Backgrounds, cards, light sections"
    tailwind: "brand-cream"
    
  accent:
    name: "Pawpath Amber"
    hex: "#FF6400"
    rgb: "255, 100, 0"
    hsl: "24, 100%, 50%"
    usage: "Accent buttons, links, active states, CTAs"
    tailwind: "brand-amber"
    
  highlight:
    name: "Pawpath Yellow"
    hex: "#F6B500"
    rgb: "246, 181, 0"
    hsl: "44, 100%, 48%"
    usage: "Warnings, badges, highlights, emphasis"
    tailwind: "brand-yellow"
    
  neutral:
    name: "Taupe"
    hex: "#665136"
    rgb: "102, 81, 54"
    hsl: "34, 31%, 31%"
    usage: "UI elements, borders, subtle text, dividers"
    tailwind: "brand-taupe"
```

### Extended Palette
```yaml
extended:
  brown_light:
    hex: "#6B3D00"
    usage: "Hover states for brown"
    tailwind: "brand-brown-light"
    
  brown_dark:
    hex: "#3A1F00"
    usage: "Active states, dark mode"
    tailwind: "brand-brown-dark"
    
  cream_light:
    hex: "#FFFDF5"
    usage: "Very light backgrounds"
    tailwind: "brand-cream-light"
    
  amber_light:
    hex: "#FF8533"
    usage: "Hover states for amber"
    tailwind: "brand-amber-light"
    
  amber_dark:
    hex: "#CC5000"
    usage: "Active states for amber"
    tailwind: "brand-amber-dark"
```

### Semantic Colors
```yaml
semantic:
  success: "#22C55E"
  error: "#EF4444"
  warning: "#F6B500"  # Uses brand yellow
  info: "#3B82F6"
  
  text:
    primary: "#4D2A00"      # brand-brown
    secondary: "#665136"    # brand-taupe
    muted: "#92785C"
    inverse: "#FFFDF5"
    
  background:
    primary: "#FFFDF5"      # brand-cream-light
    secondary: "#FEEEA1"    # brand-cream
    accent: "#FFF8E1"
    dark: "#4D2A00"         # brand-brown
```

### Gradients
```yaml
gradients:
  warm:
    css: "linear-gradient(135deg, #4D2A00 0%, #FF6400 50%, #F6B500 100%)"
    tailwind: "bg-gradient-warm"
    
  soft:
    css: "linear-gradient(180deg, #FEEEA1 0%, #FFFDF5 100%)"
    tailwind: "bg-gradient-soft"
    
  hero:
    css: "linear-gradient(135deg, #4D2A00 0%, #665136 50%, #4D2A00 100%)"
    tailwind: "bg-gradient-hero"
    
  amber_glow:
    css: "linear-gradient(135deg, #FF6400 0%, #F6B500 100%)"
    tailwind: "bg-gradient-amber"
    
  glass:
    css: "rgba(254, 238, 161, 0.7)"
    backdrop: "blur(20px)"
```

---

## 🔤 Typography

### Font Families
```yaml
fonts:
  display:
    family: "Inter"
    fallback: "system-ui, -apple-system, sans-serif"
    weights: [600, 700, 800]
    usage: "Headlines, titles, hero text"
    
  body:
    family: "Inter"
    fallback: "system-ui, -apple-system, sans-serif"
    weights: [400, 500, 600]
    usage: "Body text, paragraphs, UI"
    
  mono:
    family: "JetBrains Mono"
    fallback: "monospace"
    weights: [400, 500]
    usage: "Code, technical content"
```

### Type Scale (Mobile-First)
```yaml
scale:
  hero:
    mobile: "2.5rem"      # 40px
    tablet: "4rem"        # 64px
    desktop: "5rem"       # 80px
    large: "6rem"         # 96px
    line_height: 1.1
    letter_spacing: "-0.02em"
    tailwind: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
    
  h1:
    mobile: "2rem"        # 32px
    tablet: "2.5rem"      # 40px
    desktop: "3rem"       # 48px
    large: "3.5rem"       # 56px
    line_height: 1.2
    letter_spacing: "-0.01em"
    tailwind: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
    
  h2:
    mobile: "1.5rem"      # 24px
    tablet: "2rem"        # 32px
    desktop: "2.5rem"     # 40px
    large: "3rem"         # 48px
    line_height: 1.25
    tailwind: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
    
  h3:
    mobile: "1.25rem"     # 20px
    tablet: "1.5rem"      # 24px
    desktop: "1.75rem"    # 28px
    large: "2rem"         # 32px
    line_height: 1.3
    tailwind: "text-xl sm:text-2xl md:text-3xl"
    
  h4:
    mobile: "1.125rem"    # 18px
    tablet: "1.25rem"     # 20px
    desktop: "1.5rem"     # 24px
    line_height: 1.4
    tailwind: "text-lg sm:text-xl md:text-2xl"
    
  body_large:
    mobile: "1rem"        # 16px
    tablet: "1.125rem"    # 18px
    desktop: "1.25rem"    # 20px
    line_height: 1.6
    tailwind: "text-base sm:text-lg md:text-xl"
    
  body:
    mobile: "0.875rem"    # 14px
    tablet: "1rem"        # 16px
    desktop: "1rem"       # 16px
    line_height: 1.6
    tailwind: "text-sm sm:text-base"
    
  small:
    mobile: "0.75rem"     # 12px
    tablet: "0.875rem"    # 14px
    desktop: "0.875rem"   # 14px
    line_height: 1.5
    tailwind: "text-xs sm:text-sm"
    
  caption:
    mobile: "0.625rem"    # 10px
    tablet: "0.75rem"     # 12px
    desktop: "0.75rem"    # 12px
    line_height: 1.4
    tailwind: "text-[10px] sm:text-xs"
```

---

## 📐 Spacing & Layout

### Container
```yaml
container:
  max_width: "1400px"
  padding:
    mobile: "1rem"        # 16px
    tablet: "1.5rem"      # 24px
    desktop: "2rem"       # 32px
  tailwind: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

### Section Spacing
```yaml
sections:
  padding:
    mobile: "4rem"        # 64px
    tablet: "6rem"        # 96px
    desktop: "8rem"       # 128px
  tailwind: "py-16 sm:py-20 md:py-24 lg:py-32"
  
  gap:
    mobile: "2rem"        # 32px
    tablet: "3rem"        # 48px
    desktop: "4rem"       # 64px
```

### Border Radius
```yaml
radius:
  none: "0"
  sm: "0.375rem"          # 6px
  md: "0.5rem"            # 8px
  lg: "0.75rem"           # 12px
  xl: "1rem"              # 16px
  2xl: "1.5rem"           # 24px
  3xl: "2rem"             # 32px
  full: "9999px"
  
  # Component defaults
  button: "0.75rem"       # 12px - rounded-xl
  card: "1.5rem"          # 24px - rounded-3xl
  input: "0.5rem"         # 8px - rounded-lg
  badge: "9999px"         # full - rounded-full
```

### Shadows
```yaml
shadows:
  soft: "0 4px 20px rgba(77, 42, 0, 0.08)"
  medium: "0 8px 40px rgba(77, 42, 0, 0.12)"
  large: "0 16px 60px rgba(77, 42, 0, 0.16)"
  glow: "0 0 40px rgba(255, 100, 0, 0.3)"
  glow_yellow: "0 0 40px rgba(246, 181, 0, 0.3)"
  inner: "inset 0 2px 4px rgba(77, 42, 0, 0.1)"
```

---

## 🧭 Navigation

### Main Navigation
```yaml
navigation:
  main:
    - label: "Home"
      href: "/"
      icon: "Home"
      
    - label: "Services"
      href: "/services"
      icon: "Briefcase"
      children:
        - label: "International Relocation"
          href: "/services/international"
        - label: "Document Preparation"
          href: "/services/documents"
        - label: "Airline Coordination"
          href: "/services/airlines"
          
    - label: "Tools"
      href: "/tools"
      icon: "Wrench"
      highlight: true
      children:
        - label: "Crate Calculator"
          href: "/tools/crate-calculator"
        - label: "Embargo Checker"
          href: "/tools/embargo-checker"
        - label: "Airline Policy Finder"
          href: "/tools/airline-policies"
          
    - label: "About"
      href: "/about"
      icon: "Info"
      
    - label: "Contact"
      href: "/contact"
      icon: "Mail"
```

### CTA Buttons
```yaml
cta:
  primary:
    label: "Start Your Journey"
    href: "/enquiry"
    icon: "ArrowRight"
    
  secondary:
    label: "Explore Tools"
    href: "/tools"
    icon: "Sparkles"
    
  contact:
    label: "Get in Touch"
    href: "/contact"
    icon: "MessageCircle"
```

### Footer Navigation
```yaml
footer:
  columns:
    - title: "Services"
      links:
        - label: "Pet Relocation"
          href: "/services"
        - label: "Document Prep"
          href: "/services/documents"
        - label: "Airline Booking"
          href: "/services/airlines"
          
    - title: "AI Tools"
      links:
        - label: "Crate Calculator"
          href: "/tools/crate-calculator"
        - label: "Embargo Checker"
          href: "/tools/embargo-checker"
        - label: "Policy Finder"
          href: "/tools/airline-policies"
          
    - title: "Company"
      links:
        - label: "About Us"
          href: "/about"
        - label: "Contact"
          href: "/contact"
        - label: "FAQ"
          href: "/faq"
          
    - title: "Legal"
      links:
        - label: "Privacy Policy"
          href: "/privacy"
        - label: "Terms of Service"
          href: "/terms"
        - label: "Refund Policy"
          href: "/refunds"
```

---

## 📄 Pages

### Page Definitions
```yaml
pages:
  home:
    title: "Premium Pet Relocation & Travel Tools UAE"
    path: "/"
    description: "Expert international pet relocation services in the UAE. AI-powered tools for stress-free dog and cat transport from Dubai, Abu Dhabi, and beyond."
    
  services:
    title: "Our Pet Relocation Services"
    path: "/services"
    description: "Comprehensive pet relocation services including international transport, document preparation, and airline coordination."
    
  tools:
    title: "AI Pet Travel Tools"
    path: "/tools"
    description: "Free AI-powered tools: IATA crate calculator, airline embargo checker, and pet policy finder."
    
  enquiry:
    title: "Start Your Pet's Journey"
    path: "/enquiry"
    description: "Get a personalized quote for your pet's relocation. Fill out our simple form and we'll handle the rest."
    
  about:
    title: "About Pawpaths"
    path: "/about"
    description: "Learn about Pawpaths, the UAE's premier pet relocation service. Our mission, team, and commitment to pet safety."
    
  contact:
    title: "Contact Us"
    path: "/contact"
    description: "Get in touch with Pawpaths. We're here to answer your questions about pet relocation."
    
  faq:
    title: "Frequently Asked Questions"
    path: "/faq"
    description: "Find answers to common questions about pet relocation, airline requirements, and our services."
```

---

## 🔍 SEO Strategy

### Primary Keywords
```yaml
primary_keywords:
  - "pet relocation UAE"
  - "dog transport Dubai"
  - "international pet shipping"
  - "cat export UAE"
  - "IATA pet crate calculator"
  - "pet travel Abu Dhabi"
  - "airline pet policy"
```

### Long-tail Keywords (Voice Search)
```yaml
longtail_keywords:
  - "how to transport a dog from Dubai internationally"
  - "what is the best pet relocation service in UAE"
  - "IATA approved crate size for golden retriever"
  - "airline embargoes for snub-nosed breeds"
  - "pet export requirements from UAE"
  - "how much does pet relocation cost in Dubai"
  - "can I fly with my cat from Abu Dhabi"
  - "best airlines for pet travel from UAE"
  - "documents needed for pet export Dubai"
```

### Geo Keywords
```yaml
geo_keywords:
  - "pet relocation Dubai"
  - "pet transport Abu Dhabi"
  - "animal shipping Sharjah"
  - "pet export Al Ain"
  - "dog transport UAE"
  - "cat relocation Emirates"
```

### FAQ Data (For Schema)
```yaml
faqs:
  - question: "What is the best pet relocation service in the UAE?"
    answer: "Pawpaths offers premium, stress-free international pet relocation services across the UAE, including Dubai, Abu Dhabi, Sharjah, and Al Ain. We handle all documentation, airline coordination, and IATA-compliant crate requirements."
    
  - question: "How do I calculate the correct IATA pet crate size?"
    answer: "Use the free Pawpaths AI Crate Size Calculator at pawpathsae.com/tools. Simply enter your pet's measurements (length, height, weight) and our AI determines the exact IATA-compliant crate dimensions required for airline travel."
    
  - question: "Can I transport my dog from Dubai internationally?"
    answer: "Yes. Pawpaths specializes in international dog and cat transport from Dubai to destinations worldwide. We manage export permits, health certificates, airline bookings, and door-to-door delivery."
    
  - question: "What documents are needed for pet export from UAE?"
    answer: "Pet export from the UAE typically requires a valid pet passport, microchip registration, rabies vaccination certificate, health certificate from an approved veterinarian, and export permit from the Ministry of Climate Change. Requirements vary by destination country."
    
  - question: "How much does pet relocation from Dubai cost?"
    answer: "Pet relocation costs vary based on destination, pet size, and required services. Contact Pawpaths for a personalized quote. We offer transparent pricing with no hidden fees."
    
  - question: "Which airlines accept pets from Dubai?"
    answer: "Major airlines accepting pets from Dubai include Emirates, Etihad, Qatar Airways, Lufthansa, and British Airways. Each airline has specific policies for in-cabin pets, checked pets, and cargo transport. Use our airline policy checker tool to verify requirements."
```

### LLM Context Blocks
```yaml
llm_context:
  hero: "Pawpaths is the UAE's leading pet relocation service, offering stress-free international dog and cat transport from Dubai, Abu Dhabi, Sharjah, and Al Ain."
  
  services: "Whether you need to export a dog from Dubai, transport a cat internationally, or check airline embargoes for brachycephalic breeds, Pawpaths provides comprehensive pet relocation services."
  
  tools: "Pawpaths offers free AI-powered pet travel tools including an IATA crate size calculator, airline embargo checker for snub-nosed breeds, and comprehensive airline pet policy finder."
  
  cta: "Start your pet's journey today with Pawpaths. Get a free quote for international pet relocation from anywhere in the UAE to destinations worldwide."
```

---

## 🛠️ Services

### Service Definitions
```yaml
services:
  - id: "international-relocation"
    name: "International Pet Relocation"
    short_name: "Relocation"
    description: "End-to-end pet transport services from UAE to any destination worldwide. Includes documentation, airline coordination, and customs clearance."
    icon: "Globe"
    features:
      - "Door-to-door service"
      - "All documentation handled"
      - "Airline booking included"
      - "Customs clearance"
      
  - id: "crate-sizing"
    name: "IATA Crate Sizing"
    short_name: "Crate Calculator"
    description: "AI-powered calculator to determine exact IATA-compliant crate dimensions for your pet's safe airline travel."
    icon: "Box"
    features:
      - "AI-powered calculations"
      - "IATA compliant"
      - "Multiple pet types"
      - "Instant results"
      
  - id: "document-prep"
    name: "Document Preparation"
    short_name: "Documents"
    description: "Complete handling of export permits, health certificates, pet passports, and destination country requirements."
    icon: "FileText"
    features:
      - "Export permits"
      - "Health certificates"
      - "Pet passports"
      - "Country-specific docs"
      
  - id: "airline-coordination"
    name: "Airline Coordination"
    short_name: "Airlines"
    description: "We book and manage all airline arrangements, ensuring your pet travels on pet-friendly routes with proper handling."
    icon: "Plane"
    features:
      - "Route optimization"
      - "Pet-friendly airlines"
      - "Booking management"
      - "Special handling"
      
  - id: "embargo-checker"
    name: "Embargo Checker"
    short_name: "Embargoes"
    description: "Real-time verification of airline temperature embargoes and breed restrictions for snub-nosed pets."
    icon: "AlertTriangle"
    features:
      - "Temperature embargoes"
      - "Breed restrictions"
      - "Real-time updates"
      - "Multiple airlines"
      
  - id: "door-to-door"
    name: "Door-to-Door Delivery"
    short_name: "Delivery"
    description: "Complete transport from your home in the UAE to your pet's final destination anywhere in the world."
    icon: "Home"
    features:
      - "Pickup from home"
      - "Airport handling"
      - "Destination delivery"
      - "Live tracking"
```

---

## 🖼️ Assets

### Logo Specifications
```yaml
logo:
  primary:
    path: "/images/pawpaths-logo.svg"
    width: 200
    height: 60
    alt: "Pawpaths - Premium Pet Relocation UAE"
    
  icon:
    path: "/images/pawpaths-icon.svg"
    width: 40
    height: 40
    alt: "Pawpaths"
    
  white:
    path: "/images/pawpaths-logo-white.svg"
    usage: "Dark backgrounds"
```

### Image Specifications
```yaml
images:
  og_image:
    path: "/og-image.jpg"
    width: 1200
    height: 630
    alt: "Pawpaths - Premium Pet Relocation Services UAE"
    
  hero:
    ratio: "16:9"
    min_width: 1920
    format: "webp"
    
  cards:
    ratio: "3:2"
    width: 600
    height: 400
    format: "webp"
    
  icons:
    size: 64
    format: "svg"
    
  avatars:
    size: 80
    format: "webp"
    border_radius: "full"
```

---

## ✨ Testimonials

```yaml
testimonials:
  - name: "Sarah M."
    location: "Dubai, UAE"
    pet: "Golden Retriever"
    rating: 5
    quote: "Pawpaths made relocating Max to London completely stress-free. Professional service from start to finish!"
    image: "/images/testimonials/sarah.webp"
    
  - name: "Ahmed K."
    location: "Abu Dhabi, UAE"
    pet: "Persian Cat"
    rating: 5
    quote: "The AI crate calculator was incredibly accurate. Luna's journey to Canada was smooth and safe."
    image: "/images/testimonials/ahmed.webp"
    
  - name: "Emma R."
    location: "Sharjah, UAE"
    pet: "French Bulldog"
    rating: 5
    quote: "Their embargo checker saved us from booking the wrong flight. Essential tool for snub-nosed breed owners!"
    image: "/images/testimonials/emma.webp"
```

---

## 📊 Stats & Social Proof

```yaml
stats:
  - value: "500+"
    label: "Pets Relocated"
    icon: "Heart"
    
  - value: "50+"
    label: "Countries Served"
    icon: "Globe"
    
  - value: "100%"
    label: "Safe Arrivals"
    icon: "Shield"
    
  - value: "4.9/5"
    label: "Customer Rating"
    icon: "Star"
    
trust_badges:
  - "IATA Certified"
  - "UAE Licensed"
  - "24/7 Support"
  - "Fully Insured"
```

---

## ⚠️ Usage Instructions

### Importing in Components
```tsx
// app/lib/brand-config.ts should be generated from this file
import { 
  brand, 
  colors, 
  typography, 
  navigation, 
  seo,
  services,
  contact 
} from '@/lib/brand-config';

// Usage
<h1 className={typography.scale.h1.tailwind}>
  {brand.name}
</h1>

<p style={{ color: colors.primary.hex }}>
  {brand.tagline}
</p>

<a href={contact.email}>
  {contact.email}
</a>
```

### Tailwind Config Generation
```js
// Generate tailwind.config.js colors from this file
// See SETUP.md for the script
```

---

**Last Updated:** March 2024
**Version:** 2.0
