# 🐾 PAWPATHS HOMEPAGE DEVELOPMENT PROMPT

**Copy this entire prompt into Claude Code or save it as `.claude/skills/pawpaths-builder/SKILL.md`**

---

## Context

I am developing the homepage for **Pawpaths** - a premium pet relocation service in the UAE. Build each section step-by-step from reference screenshots I upload.

## Rules

1. **ANALYZE** every uploaded screenshot systematically before coding
2. **NEVER** use colors from screenshots - use ONLY Pawpaths brand colors below
3. **CREATE** each section as a separate component in `app/(homepage)/components/sections/`
4. **ADD** SEO/AI optimization (semantic HTML, ARIA, JSON-LD) to every section
5. **PROVIDE** image guidelines when screenshots contain images

## Brand Colors (MANDATORY)

```
Primary:    #4D2A00  (brand-brown)    → Headers, CTAs, Text
Secondary:  #FEEEA1  (brand-cream)    → Backgrounds, Cards
Accent:     #FF6400  (brand-amber)    → Buttons, Links, Active
Highlight:  #F6B500  (brand-yellow)   → Badges, Warnings
UI:         #665136  (brand-taupe)    → Borders, Subtle text
```

## Tech Stack

- Next.js 14+ (App Router)
- Tailwind CSS
- Framer Motion (animations)
- TypeScript
- Lucide React (icons)

## Project Structure

```
app/
├── page.tsx                 # Imports all sections
├── (homepage)/
│   └── components/
│       ├── sections/        # Each section as separate file
│       │   ├── NavBar.tsx
│       │   ├── HeroSection.tsx
│       │   ├── MarqueeBar.tsx
│       │   ├── ServicesGrid.tsx
│       │   ├── ToolsShowcase.tsx
│       │   ├── ProcessTimeline.tsx
│       │   ├── Testimonials.tsx
│       │   ├── FAQAccordion.tsx
│       │   ├── CTABanner.tsx
│       │   └── Footer.tsx
│       └── ui/              # Reusable components
│           ├── Button.tsx
│           ├── GlassCard.tsx
│           └── AnimatedHeading.tsx
```

## Section Development Order

1. NavBar (fixed, glassmorphism)
2. HeroSection (full viewport, CTAs)
3. MarqueeBar (scrolling trust badges)
4. ServicesGrid (6 service cards)
5. ToolsShowcase (AI tools preview)
6. ProcessTimeline (how it works)
7. Testimonials (reviews carousel)
8. FAQAccordion (with schema)
9. CTABanner (final CTA)
10. Footer (links, legal)

## When I Upload a Screenshot

### Step 1: Analyze
```markdown
## Section Analysis: [Name]

### Layout
- Container: [max-width, padding]
- Structure: [grid/flex columns]
- Responsive: [mobile/tablet/desktop notes]

### Elements
1. [Element]: [Description]
2. [Element]: [Description]
...

### Color Mapping
- [Screenshot color] → [Pawpaths equivalent]

### Images Required
- [Image]: [Dimensions], [Content suggestion], [Alt text]

### Animations
- [Element]: [Animation type]
```

### Step 2: Build
- Production-ready code
- Mobile-first responsive
- Semantic HTML with ARIA
- Framer Motion animations

### Step 3: SEO Optimize
- JSON-LD schema (if applicable)
- Proper heading hierarchy
- LLM context block:
```tsx
<p className="sr-only">
  Natural language description with target keywords...
</p>
```

## Component Templates

### Section Wrapper
```tsx
<section
  id="section-name"
  aria-labelledby="section-name-heading"
  className="py-16 md:py-24 lg:py-32"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <h2 id="section-name-heading" className="...">
      Title
    </h2>
    {/* Content */}
  </div>
</section>
```

### Glass Card
```tsx
<article className="rounded-3xl bg-brand-cream/70 backdrop-blur-xl border border-brand-brown/10 shadow-soft p-6 md:p-8 hover:shadow-medium transition-shadow">
```

### CTA Button
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

## Image Guidelines

| Type | Size | Format | Notes |
|------|------|--------|-------|
| Hero | 1920×1080 | WebP | Priority loading |
| Cards | 600×400 | WebP | 3:2 ratio |
| Icons | 64×64 | SVG | Brand colors |
| OG | 1200×630 | JPG | Social sharing |

## Business Context (for SEO content)

- **Name**: Pawpaths (Legal: Tekitool Solutions)
- **Location**: Dubai, UAE
- **Service Areas**: Dubai, Abu Dhabi, Sharjah, Al Ain
- **Services**: Pet relocation, export permits, IATA crate sizing, airline coordination
- **Target Keywords**: pet relocation UAE, dog transport Dubai, international pet shipping, IATA crate calculator

## Quality Checklist (After Each Section)

- [ ] Only brand colors used
- [ ] Mobile responsive
- [ ] Semantic HTML (`<section>`, `<article>`, etc.)
- [ ] ARIA labels on interactions
- [ ] Proper heading hierarchy
- [ ] Images use Next/Image
- [ ] Animations smooth
- [ ] No console errors

---

## Ready!

Upload your first screenshot (start with NavBar) and I'll:

1. ✅ Analyze the design
2. ✅ Map to Pawpaths brand
3. ✅ Build responsive component
4. ✅ Add SEO/AI features
5. ✅ Provide image specs

**Paste this prompt, then upload your first screenshot!** 🐾
