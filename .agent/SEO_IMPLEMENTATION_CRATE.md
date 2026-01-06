# ✅ Crate Size Calculator SEO Upgrade

## Summary
Implemented high-performance SEO metadata and JSON-LD structured data to target the "Global Logistics" keyword cluster.

## Changes Implemented

### 1. Metadata Configuration (Server-Side)
**File:** `app/tools/crate-size-calculator/layout.tsx`
- Created a new layout file to handle metadata export (required for Client Components).
- **Title:** "IATA Dog Crate Calculator 2026 | Avoid Airline Rejection - Pawpaths"
- **Description:** Optimized for click-through rate with specific airline mentions (Emirates, Qatar Airways).
- **Keywords:** Targeted list including "IATA crate calculator", "sky kennel dimensions", "snub-nose dog crate".
- **OpenGraph:** Rich social sharing card configuration.

### 2. JSON-LD Structured Data (Client-Side)
**File:** `app/tools/crate-size-calculator/page.tsx`
- Injected `WebApplication` schema via `application/ld+json` script.
- **Schema Type:** `WebApplication` / `UtilityApplication`
- **Features:** "IATA Compliance Check", "Snub-Nose Breed Logic".
- **Benefits:** Helps Google understand this is a functional software tool, increasing the chance of Rich Results.

## Verification
- **Metadata:** Check `<head>` tags in browser dev tools.
- **Structured Data:** Test URL in [Google Rich Results Test](https://search.google.com/test/rich-results).

## Next Steps
- Ensure `/images/og-crate-calculator.jpg` exists in the public folder for social sharing.
- Request indexing in Google Search Console once deployed.
