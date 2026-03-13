---
name: pawpaths-homepage-builder
description: Ultra-modern, SEO-optimized homepage builder for Pawpaths pet relocation. Use when developing homepage sections from reference screenshots. Triggers on requests for homepage components, hero sections, navigation, or any Pawpaths UI development.
---

# Pawpaths Homepage Development Skill

## Project Context

You are building the homepage for **Pawpaths** — a premium pet relocation and travel tools service based in the UAE. The homepage must be:

- **Ultra-modern & Futuristic**: Cutting-edge design with smooth animations, glassmorphism, gradients, and micro-interactions
- **Content-rich**: SEO-optimized with semantic HTML, structured data, and AI/voice search optimization
- **Brand-oriented**: Strictly following Pawpaths color palette and visual identity
- **Performance-first**: Next.js 14+ App Router, Tailwind CSS, optimized images, lazy loading

---

## Brand Design System

### Color Palette (MANDATORY)

```css
:root {
  /* Primary Brand Colors */
  --brand-brown: #4D2A00;        /* Primary - Headers, CTAs, Important text */
  --brand-cream: #FEEEA1;        /* Secondary - Backgrounds, Cards, Highlights */
  --brand-amber: #FF6400;        /* Accent - Buttons, Links, Active states */
  --brand-yellow: #F6B500;       /* Warning/Highlight - Badges, Alerts, Emphasis */
  --brand-taupe: #665136;        /* UI Elements - Borders, Subtle text, Dividers */
  
  /* Extended Palette (Derived) */
  --brand-brown-light: #6B3D00;  /* Hover states */
  --brand-brown-dark: #3A1F00;   /* Active states */
  --brand-cream-light: #FFFDF5;  /* Light backgrounds */
  --brand-amber-light: #FF8533;  /* Hover accent */
  --brand-gradient-warm: linear-gradient(135deg, #4D2A00 0%, #FF6400 50%, #F6B500 100%);
  --brand-gradient-soft: linear-gradient(180deg, #FEEEA1 0%, #FFFDF5 100%);
  --brand-gradient-hero: linear-gradient(135deg, #4D2A00 0%, #665136 50%, #4D2A00 100%);
}
```

### Typography Scale

```css
/* Font: Inter or similar modern sans-serif */
--font-display: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;

/* Sizes */
--text-hero: clamp(3rem, 8vw, 6rem);      /* Hero headlines */
--text-h1: clamp(2.5rem, 5vw, 4rem);      /* Page titles */
--text-h2: clamp(2rem, 4vw, 3rem);        /* Section titles */
--text-h3: clamp(1.5rem, 3vw, 2rem);      /* Card titles */
--text-body: 1rem;                         /* Body text */
--text-small: 0.875rem;                    /* Captions */
```

### Design Tokens

```css
/* Spacing */
--section-padding: clamp(4rem, 10vw, 8rem);
--container-max: 1400px;
--card-radius: 1.5rem;
--button-radius: 0.75rem;

/* Shadows */
--shadow-soft: 0 4px 20px rgba(77, 42, 0, 0.08);
--shadow-medium: 0 8px 40px rgba(77, 42, 0, 0.12);
--shadow-glow: 0 0 40px rgba(255, 100, 0, 0.3);

/* Glassmorphism */
--glass-bg: rgba(254, 238, 161, 0.7);
--glass-blur: blur(20px);
--glass-border: 1px solid rgba(77, 42, 0, 0.1);
```

---

## File Structure (MANDATORY)

```
app/
├── page.tsx                          # Main homepage entry (imports all sections)
├── layout.tsx                        # Root layout with metadata
├── globals.css                       # Tailwind + custom properties
│
├── (homepage)/                       # Homepage components folder
│   ├── components/
│   │   ├── sections/
│   │   │   ├── NavBar.tsx           # Section 01: Navigation
│   │   │   ├── HeroSection.tsx      # Section 02: Hero with CTA
│   │   │   ├── MarqueeBar.tsx       # Section 03: Scrolling trust badges
│   │   │   ├── ServicesGrid.tsx     # Section 04: Service cards
│   │   │   ├── ToolsShowcase.tsx    # Section 05: AI Tools preview
│   │   │   ├── ProcessTimeline.tsx  # Section 06: How it works
│   │   │   ├── Testimonials.tsx     # Section 07: Reviews carousel
│   │   │   ├── FAQAccordion.tsx     # Section 08: FAQ with schema
│   │   │   ├── CTABanner.tsx        # Section 09: Call to action
│   │   │   └── Footer.tsx           # Section 10: Footer
│   │   │
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── AnimatedText.tsx
│   │   │   └── GlassCard.tsx
│   │   │
│   │   └── seo/                      # SEO components
│   │       ├── JsonLd.tsx           # Structured data wrapper
│   │       ├── LocalBusinessSchema.tsx
│   │       ├── FAQSchema.tsx
│   │       └── BreadcrumbSchema.tsx
│   │
│   ├── hooks/
│   │   ├── useScrollAnimation.ts
│   │   └── useIntersectionObserver.ts
│   │
│   └── lib/
│       ├── seo-config.ts            # Centralized SEO configuration
│       └── animations.ts            # Framer Motion variants
│
└── public/
    ├── og-image.jpg                 # 1200×630 social preview
    ├── images/
    │   └── homepage/                # Section-specific images
    └── icons/
        └── pawpaths-logo.svg
```

---

## Section Development Workflow

### When User Uploads a Screenshot:

1. **ANALYZE** the screenshot systematically:
   - Identify layout structure (grid, flex, positioning)
   - Count and categorize UI elements (buttons, text, images, icons)
   - Note spacing patterns and visual hierarchy
   - Identify animations/interactions implied by design
   - Measure approximate proportions and ratios

2. **PLAN** the implementation:
   ```
   ## Section Analysis: [Section Name]
   
   ### Layout Structure
   - Container: [max-width, padding]
   - Grid/Flex: [columns, gaps, alignment]
   - Responsive breakpoints: [mobile, tablet, desktop]
   
   ### Elements Identified
   1. [Element type]: [Description]
   2. [Element type]: [Description]
   ...
   
   ### Color Mapping (Screenshot → Pawpaths)
   - [Original color] → [Pawpaths equivalent]
   ...
   
   ### Image Requirements
   - Image 1: [dimensions]px, [content suggestion], [alt text]
   ...
   
   ### Animations
   - [Element]: [Animation type, trigger, duration]
   ...
   ```

3. **BUILD** with these principles:
   - Mobile-first responsive design
   - Semantic HTML5 with ARIA labels
   - Tailwind CSS with custom brand utilities
   - Framer Motion for animations
   - Next.js Image component for all images

4. **OPTIMIZE** for SEO/AI:
   - Add JSON-LD structured data where applicable
   - Include natural language paragraphs for LLM context
   - Use proper heading hierarchy (single H1 per page)
   - Add descriptive ARIA labels to all interactive elements

---

## SEO/AI Optimization Checklist (APPLY TO EVERY SECTION)

### Semantic HTML
```tsx
// ✅ CORRECT
<section aria-labelledby="services-heading" className="...">
  <h2 id="services-heading">Our Pet Relocation Services</h2>
  <article aria-label="International Pet Transport">
    ...
  </article>
</section>

// ❌ WRONG
<div className="...">
  <div className="text-3xl font-bold">Our Pet Relocation Services</div>
  <div>...</div>
</div>
```

### LLM Context Blocks
```tsx
{/* Hidden context for AI crawlers and voice search */}
<p className="sr-only" aria-hidden="false">
  Pawpaths provides professional pet relocation services from Dubai, 
  Abu Dhabi, Sharjah, and Al Ain. We specialize in international dog 
  transport, cat export permits, and IATA-compliant crate sizing for 
  airline travel.
</p>
```

### Structured Data Per Section
```tsx
// For service sections
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "International Pet Relocation",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pawpaths"
  },
  "areaServed": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain"],
  "description": "..."
};

// For FAQ sections
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
};
```

### Voice Search Optimization
- Use natural question-answer format in content
- Include conversational phrases: "How do I...", "What is the best..."
- Target featured snippet format (40-60 word answers)

---

## Component Templates

### Section Wrapper Template
```tsx
// app/(homepage)/components/sections/SectionTemplate.tsx
import { memo } from 'react';

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}

const Section = memo(function Section({ 
  id, 
  children, 
  className = '',
  ariaLabel 
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      aria-label={ariaLabel}
      className={`
        relative w-full
        py-16 md:py-24 lg:py-32
        ${className}
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
});

export default Section;
```

### Animated Heading Template
```tsx
// app/(homepage)/components/ui/AnimatedHeading.tsx
'use client';

import { motion } from 'framer-motion';

interface AnimatedHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeading({
  as: Tag = 'h2',
  id,
  children,
  className = ''
}: AnimatedHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Tag
        id={id}
        className={`
          font-bold tracking-tight
          text-brand-brown
          ${Tag === 'h1' ? 'text-4xl md:text-5xl lg:text-6xl' : ''}
          ${Tag === 'h2' ? 'text-3xl md:text-4xl lg:text-5xl' : ''}
          ${Tag === 'h3' ? 'text-2xl md:text-3xl' : ''}
          ${className}
        `}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
```

### Glass Card Template
```tsx
// app/(homepage)/components/ui/GlassCard.tsx
'use client';

import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className = '',
  hover = true 
}: GlassCardProps) {
  return (
    <motion.article
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden
        rounded-3xl
        bg-brand-cream/70 backdrop-blur-xl
        border border-brand-brown/10
        shadow-soft
        p-6 md:p-8
        ${hover ? 'cursor-pointer hover:shadow-medium hover:border-brand-amber/30' : ''}
        ${className}
      `}
    >
      {children}
    </motion.article>
  );
}
```

---

## Image Guidelines

### When Screenshot Contains Images:

1. **Hero Images**
   - Dimensions: 1920×1080px minimum (desktop), 1080×1920px (mobile)
   - Format: WebP with JPEG fallback
   - Content: Professional pet photography, UAE landmarks with pets
   - Alt text: Descriptive, keyword-rich ("Golden retriever being transported in IATA-approved crate at Dubai airport")

2. **Service Icons**
   - Dimensions: 64×64px or 128×128px
   - Format: SVG preferred, PNG fallback
   - Style: Line icons matching brand colors

3. **Card Images**
   - Dimensions: 600×400px (3:2 ratio) or 400×400px (1:1)
   - Content: Service-specific imagery
   - Treatment: Slight warm overlay matching brand

4. **Background Images**
   - Apply brand color overlay: `bg-gradient-to-r from-brand-brown/90 to-brand-taupe/80`
   - Use Next.js Image with priority for above-fold

### Image Component Usage
```tsx
import Image from 'next/image';

<div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
  <Image
    src="/images/homepage/hero-pet-travel.webp"
    alt="Happy golden retriever in professional pet travel crate at Dubai International Airport"
    fill
    priority // Only for above-fold images
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
    className="object-cover"
  />
  {/* Warm brand overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/60 via-transparent to-transparent" />
</div>
```

---

## Animation Library

### Scroll Animations (Framer Motion)
```tsx
// app/(homepage)/lib/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};
```

### Micro-interactions
```tsx
// Button hover glow
<motion.button
  whileHover={{ 
    scale: 1.05,
    boxShadow: "0 0 30px rgba(255, 100, 0, 0.4)"
  }}
  whileTap={{ scale: 0.98 }}
  className="..."
>

// Card tilt effect (optional)
<motion.div
  whileHover={{ rotateY: 5, rotateX: 5 }}
  style={{ transformPerspective: 1000 }}
>
```

---

## Tailwind Config Extensions

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#4D2A00',
          'brown-light': '#6B3D00',
          'brown-dark': '#3A1F00',
          cream: '#FEEEA1',
          'cream-light': '#FFFDF5',
          amber: '#FF6400',
          'amber-light': '#FF8533',
          yellow: '#F6B500',
          taupe: '#665136',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(77, 42, 0, 0.08)',
        'medium': '0 8px 40px rgba(77, 42, 0, 0.12)',
        'glow': '0 0 40px rgba(255, 100, 0, 0.3)',
        'glow-yellow': '0 0 40px rgba(246, 181, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #4D2A00 0%, #FF6400 50%, #F6B500 100%)',
        'gradient-soft': 'linear-gradient(180deg, #FEEEA1 0%, #FFFDF5 100%)',
        'gradient-hero': 'linear-gradient(135deg, #4D2A00 0%, #665136 50%, #4D2A00 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 100, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 100, 0, 0.6)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    }
  }
}
```

---

## Quality Checklist (Run After Each Section)

### Accessibility
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] All images have descriptive alt text
- [ ] Interactive elements have focus states
- [ ] ARIA labels on all buttons and links
- [ ] Keyboard navigation works correctly

### SEO
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Semantic HTML tags used
- [ ] JSON-LD schema added where applicable
- [ ] Meta descriptions for linked pages
- [ ] Internal links have descriptive anchor text

### Performance
- [ ] Images use Next.js Image component
- [ ] Above-fold images have priority={true}
- [ ] Lazy loading for below-fold content
- [ ] No layout shift (CLS optimization)
- [ ] Animations use transform/opacity only

### Brand Consistency
- [ ] Only Pawpaths brand colors used
- [ ] Typography follows scale
- [ ] Spacing is consistent
- [ ] Border radius matches design system
- [ ] Hover states match brand feel

---

## Example: NavBar Section Implementation

When user uploads NavBar screenshot, respond with:

```markdown
## Section Analysis: Navigation Bar

### Layout Structure
- Fixed position, full-width
- Container: max-w-7xl, px-6
- Flex layout: justify-between, items-center
- Height: h-20 (80px)

### Elements Identified
1. Logo (left): Pawpaths wordmark/icon
2. Nav Links (center): 5-6 menu items
3. CTA Button (right): "Book Now" or similar
4. Mobile Menu Toggle (hidden on desktop)

### Color Mapping
- Background: transparent → brand-cream/80 on scroll
- Text: [original] → brand-brown
- CTA: [original] → brand-amber with brand-brown text
- Hover: → brand-amber-light

### Animations
- Scroll: Glassmorphism effect activates
- Links: Underline slide animation
- CTA: Glow pulse on hover

### Implementation Plan
1. Create NavBar.tsx component
2. Add scroll detection hook
3. Implement mobile drawer
4. Add JSON-LD Organization schema
```

Then provide the complete, production-ready code.

---

## Business Context for SEO Content

Use these facts in natural language content blocks:

- **Business Name**: Pawpaths (Legal: Tekitool Solutions)
- **Services**: International pet relocation, pet export/import, airline coordination, IATA crate sizing, document preparation
- **Location**: Dubai, UAE (serves Dubai, Abu Dhabi, Sharjah, Al Ain)
- **Unique Value**: AI-powered tools for crate calculation, embargo checking, stress-free pet travel
- **Target Keywords**:
  - "pet relocation UAE"
  - "dog transport Dubai"
  - "international pet shipping Abu Dhabi"
  - "IATA pet crate calculator"
  - "pet export Dubai"
  - "airline pet policy checker"

---

## Ready to Build

Upload your first screenshot (Navigation Bar recommended) and I will:

1. ✅ Analyze the design systematically
2. ✅ Map colors to Pawpaths brand
3. ✅ Plan responsive implementation
4. ✅ Build production-ready code
5. ✅ Add SEO/accessibility features
6. ✅ Include animation and micro-interactions
7. ✅ Provide image replacement guidelines

**Let's begin!** 🐾
