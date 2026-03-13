# Pawpaths Homepage Builder - Quick Reference

## 🎨 Brand Colors (Copy-Paste Ready)

```css
/* Tailwind Classes */
bg-brand-brown      /* #4D2A00 - Primary */
bg-brand-cream      /* #FEEEA1 - Secondary */
bg-brand-amber      /* #FF6400 - Accent */
bg-brand-yellow     /* #F6B500 - Highlight */
bg-brand-taupe      /* #665136 - UI Elements */

text-brand-brown
text-brand-cream
text-brand-amber
text-brand-yellow
text-brand-taupe
```

## 📐 Section Development Order

1. ☐ NavBar (fixed, glassmorphism on scroll)
2. ☐ HeroSection (full viewport, CTA)
3. ☐ MarqueeBar (infinite scroll badges)
4. ☐ ServicesGrid (6 service cards)
5. ☐ ToolsShowcase (AI tools preview)
6. ☐ ProcessTimeline (how it works)
7. ☐ Testimonials (review carousel)
8. ☐ FAQAccordion (with schema)
9. ☐ CTABanner (final call to action)
10. ☐ Footer (links, legal, contact)

## 🗂️ File Naming Convention

```
app/(homepage)/components/sections/[SectionName].tsx
app/(homepage)/components/ui/[ComponentName].tsx
app/(homepage)/components/seo/[SchemaType]Schema.tsx
```

## ⚡ Quick Component Starters

### Section Container
```tsx
<section
  id="section-name"
  aria-labelledby="section-name-heading"
  className="py-16 md:py-24 lg:py-32"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

### Glass Card
```tsx
<div className="rounded-3xl bg-brand-cream/70 backdrop-blur-xl border border-brand-brown/10 shadow-soft p-6 md:p-8">
```

### Gradient Button
```tsx
<button className="bg-brand-amber hover:bg-brand-amber-light text-brand-brown font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-glow">
```

### Animated Entry
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

## 🔍 SEO Checklist Per Section

- [ ] Semantic HTML (`<section>`, `<article>`, `<nav>`)
- [ ] Proper heading hierarchy
- [ ] ARIA labels on interactive elements
- [ ] Alt text on all images
- [ ] JSON-LD schema where applicable
- [ ] Natural language paragraph for LLM context

## 📱 Responsive Breakpoints

```
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

## 🖼️ Image Sizes Reference

| Usage | Dimensions | Format |
|-------|------------|--------|
| Hero | 1920×1080 | WebP |
| Cards | 600×400 | WebP |
| Icons | 64×64 | SVG |
| OG Image | 1200×630 | JPG |
| Logo | 200×60 | SVG |

## 🎭 Animation Timings

```tsx
// Standard
transition={{ duration: 0.3 }}

// Medium
transition={{ duration: 0.6, ease: "easeOut" }}

// Smooth
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}

// Stagger children
transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
```

## 📝 LLM Context Block Template

```tsx
{/* SEO: Natural language context for AI crawlers */}
<p className="sr-only">
  Pawpaths provides [service description] in Dubai, Abu Dhabi, 
  Sharjah, and Al Ain. [Feature] enables [benefit].
</p>
```

## ✅ Before Committing Checklist

- [ ] All brand colors correct (no external colors)
- [ ] Mobile responsive tested
- [ ] Animations smooth (no jank)
- [ ] No console errors
- [ ] Images optimized with Next/Image
- [ ] Accessibility audit passed
- [ ] Lighthouse SEO score > 90
