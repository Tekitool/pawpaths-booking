# Refactor with Claude – Audit & Plan

> **Status:** Analysis Complete | No Code Changes Applied
> **Generated:** 2026-03-10
> **Project:** Pawpaths Booking Management System (BMS)
> **Completion:** ~60%

---

## 1. Overview

Pawpaths BMS is a Next.js 16 (App Router) pet relocation management platform built atop Supabase (PostgreSQL) with a multi-step public booking wizard and a full admin back-office. The codebase is functional but exhibits hallmarks of rapid AI-generated development: duplicated logic across parallel data-mapping functions, inconsistent TypeScript adoption (most files are `.js`/`.jsx` with a few `.ts`/`.tsx`), **no active middleware** (auth guard is commented out), and **zero automated tests**. Several critical security gaps exist — the public booking API has no rate limiting, no CSRF protection, and the admin panel's route-level auth checks rely solely on client-side role checks rather than middleware enforcement. The database schema is well-structured with proper RLS policies, but the application layer doesn't always leverage them correctly.

**Key Observations:**
- **No active middleware.js** — only `.bak` files remain. All `/admin/*` routes are unprotected at the edge.
- **Mixed JS/TS** — ~80% JavaScript, ~20% TypeScript, with `any` types used freely in the TS files.
- **Duplicate data-mapping functions** — booking data is mapped in 3+ different places with different shapes.
- **31 console.log/warn statements** in production app/ code.
- **Zero tests** — no test directory, no test scripts, no test dependencies.
- **Unused dependency** — `next-auth@5.0.0-beta.30` is installed but never imported (Supabase Auth is used instead).
- **7+ Python refactor scripts** and 24+ Node utility scripts cluttering project root.

**Disclaimer:** This document contains analysis and recommendations only. No code has been modified. All changes require explicit user approval.

---

## 2. Scorecard

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Architecture & Structure | 5/10 | Reasonable folder layout but significant code duplication and dead files |
| Code Quality | 4/10 | Inconsistent TS/JS mix, `any` types, no linting enforcement, 31+ console statements |
| Performance | 6/10 | Server Components used well, parallel fetching in dashboard, but no caching strategy |
| Database & Queries | 7/10 | Good schema with RLS, indexes, and triggers; some N+1 patterns in booking API |
| Security & Privacy | 3/10 | No active middleware, no route protection, no rate limiting, admin client singleton at module scope |
| Reliability & Observability | 4/10 | No error boundaries, inconsistent error handling, no logging/monitoring strategy |
| DevEx & Maintainability | 3/10 | No tests, no CI/CD, 30+ dead/utility files in project root |
| **Overall** | **4.6/10** | **Functional prototype requiring significant hardening before production** |

---

## 3. Detailed Findings and Refactor Items

---

### [1] No Active Middleware — Admin Routes Unprotected

**Status:** ⬜ Pending (not started)

**Category:** Security

**Severity:** Critical

**Context:**
Files: `middleware.js.bak_debug`, `middleware.js.bak_old`
No active `middleware.js` or `middleware.ts` exists in the project root.

**Issue Description:**
The Next.js middleware has been commented out and renamed to `.bak` files. The entire auth guard logic is disabled — `const user = null; // Simulate no user`. This means every route including `/admin/*` is publicly accessible without authentication.

**Impact:**
- Any unauthenticated user can access admin pages directly by URL.
- Session tokens are not being refreshed by middleware, leading to stale sessions.
- No CSRF protection at the edge layer.

**Proposed Solution:**
Restore a proper `middleware.ts` that:
1. Creates a Supabase server client with cookie handling
2. Calls `supabase.auth.getUser()` to validate sessions
3. Redirects unauthenticated users from `/admin/*` and `/dashboard/*` to `/login`
4. Redirects authenticated users from `/login` to `/admin/dashboard`
5. Allows public routes (`/enquiry`, `/tools/*`, `/services`, `/api/booking`) to pass through

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None

---

### [2] Duplicate Booking Data-Mapping Functions

**Status:** ⬜ Pending (not started)

**Category:** Architecture

**Severity:** High

**Context:**
Files: `lib/actions/booking-actions.js` (lines 9-88 `mapBooking`), `lib/actions/admin-booking-actions.js` (lines 69-165 `mapSupabaseToPage`), `app/admin/relocations/page.js` (lines 94-121 inline mapping)

**Issue Description:**
Booking data from Supabase is mapped to frontend models in **three separate locations** with inconsistent output shapes:
- `mapBooking()` returns `{ _id, customer, customerInfo, travel, travelDetails, ... }` (duplicated keys)
- `mapSupabaseToPage()` returns `{ id, customerInfo, travelDetails, items, ... }` (different shape)
- `relocations/page.js` does inline mapping with a third shape (`{ bookingId, customerInfo, pets, ... }`)

This makes it impossible to share components across views and creates maintenance nightmares.

**Impact:**
- Any schema change requires updates in 3+ places
- Components receiving booking data cannot be reused
- Bug fixes in mapping logic must be duplicated

**Proposed Solution:**
Create a single `lib/mappers/booking-mapper.ts` module with:
1. A canonical `BookingViewModel` TypeScript interface
2. One `mapBookingToViewModel(raw)` function used everywhere
3. Optional "list view" and "detail view" projections from the same base type

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None

---

### [3] `manageUser.ts` Uses `any` Types Extensively

**Status:** ⬜ Pending (not started)

**Category:** Code Quality

**Severity:** High

**Context:**
File: `lib/actions/manageUser.ts` — `formData: any` on lines 6, 58; `error: any` on lines 52, 103, 116, 129

**Issue Description:**
The only TypeScript server-action file in the project defeats the purpose of TypeScript by using `any` for all function parameters and catch clauses. Additionally, `createUserAction` and `updateUserAction` in this file duplicate similar logic to `createUser` and `updateUser` in `lib/actions/user-actions.js`.

**Impact:**
- No compile-time type checking on user form data
- Two sets of user management functions with divergent behavior
- `catch (error: any)` prevents proper error narrowing

**Proposed Solution:**
1. Define a `UserFormData` interface with proper fields
2. Remove `any` — use the interface for params, `unknown` for catch clauses
3. Consolidate with `user-actions.js` into a single `user-actions.ts` module
4. Add Zod validation schema for user form data

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None

---

### [4] Public Booking API Has No Rate Limiting or Server-Side Validation

**Status:** ⬜ Pending (not started)

**Category:** Security

**Severity:** Critical

**Context:**
File: `app/api/booking/route.js`

**Issue Description:**
The public booking endpoint (`POST /api/booking`) accepts FormData, parses JSON fields, creates database records, uploads files, and sends emails — all without:
1. **Rate limiting** — A bot could submit thousands of bookings
2. **Server-side schema validation** — The Zod `EnquirySchema` in `lib/schemas.ts` exists but is never used in the API route
3. **No authentication** — By design (public form), but creates abuse risk without rate limiting
4. **Email sending is blocking** — Despite the timeout wrapper, a slow SMTP server delays the response

**Impact:**
- Vulnerable to spam/abuse attacks that create junk database records
- Malformed data can reach the database (no Zod validation applied)
- Email failures can cause user-facing delays

**Proposed Solution:**
1. Apply `EnquirySchema.safeParse()` before any database operations
2. Add Upstash Redis rate limiting (e.g., 5 submissions per IP per hour)
3. Move email sending to a background job or fire-and-forget pattern
4. Add honeypot field for bot detection

**Estimated Effort:** Medium

**Dependencies:** Upstash Redis setup (optional, can start with in-memory)

**Visual Impact:** None

---

### [5] Supabase Admin Client Initialized as Module-Level Singleton

**Status:** ⬜ Pending (not started)

**Category:** Security

**Severity:** High

**Context:**
File: `lib/supabase/admin.js`

**Issue Description:**
The `supabaseAdmin` client (using the **service role key**) is created at module scope and exported as a singleton. Additionally, in `admin-booking-actions.js:73`, a *new* admin client is created inline inside `mapSupabaseToPage()` using raw env vars, bypassing the centralized admin module entirely.

This pattern means:
1. The service role key is loaded at import time, even in client bundles if not careful with tree-shaking
2. Two competing admin client creation patterns exist

**Impact:**
- Risk of service role key leaking to client bundles if imported in the wrong context
- Inconsistent admin client usage across the codebase
- No connection pooling or lifecycle management

**Proposed Solution:**
1. Ensure `lib/supabase/admin.js` is only ever imported from `'use server'` files
2. Remove the inline `createAdminClient()` call in `admin-booking-actions.js`
3. Use the centralized `supabaseAdmin` import consistently
4. Add a build-time check or `server-only` package import to prevent client bundling

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** None

---

### [6] No Error Boundaries or Global Error UI

**Status:** ⬜ Pending (not started)

**Category:** Reliability

**Severity:** High

**Context:**
Files: `app/` directory — no `error.tsx`, `not-found.tsx`, or `loading.tsx` at root or admin level

**Issue Description:**
The application has no React Error Boundaries or Next.js error files:
- No `app/error.tsx` — unhandled errors show the default Next.js error page
- No `app/admin/error.tsx` — admin errors have no graceful fallback
- No `app/admin/loading.tsx` — no skeleton/loading states at the layout level
- No `app/not-found.tsx` — 404s show default page

**Impact:**
- Unhandled exceptions crash the entire page with no recovery option
- Users see generic error pages with no brand or guidance
- No distinction between auth errors and data errors

**Proposed Solution:**
Add Next.js conventional files:
1. `app/error.tsx` — Root error boundary with "Try Again" button
2. `app/not-found.tsx` — Branded 404 page
3. `app/admin/error.tsx` — Admin-specific error handler
4. `app/admin/loading.tsx` — Skeleton loading states

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** New error/loading UI (must match existing design system)

---

### [7] Zero Automated Tests

**Status:** ⬜ Pending (not started)

**Category:** DevEx & Maintainability

**Severity:** High

**Context:**
No `__tests__/`, `tests/`, or `*.test.*` files exist. No test runner configured in `package.json`.

**Issue Description:**
The project has zero automated tests — no unit tests, integration tests, or end-to-end tests. Critical business logic like service type detection (`utils/bookingLogic.ts`), booking mapping, and the enquiry validation schema have no test coverage.

**Impact:**
- Any refactoring risks breaking existing functionality with no safety net
- Regression bugs are only caught in production
- Cannot confidently deploy changes

**Proposed Solution:**
1. Install Vitest + React Testing Library
2. Write unit tests for critical pure functions first:
   - `utils/bookingLogic.ts` — `detectBookingContext()`
   - `lib/schemas.ts` — `EnquirySchema` validation
   - Data mapping functions (once consolidated per Item #2)
3. Add E2E smoke tests with Playwright for the booking wizard flow
4. Add `test` script to `package.json`

**Estimated Effort:** Large

**Dependencies:** Item #2 (consolidate mappers first)

**Visual Impact:** None

---

### [8] Unused Dependencies and Project Root Clutter

**Status:** ⬜ Pending (not started)

**Category:** DevEx & Maintainability

**Severity:** Medium

**Context:**
Files: `package.json`, 7x `refactor_*.py` scripts, `lint.log`, `lint_final.log`, `lint_output.txt`, `verify_output.txt`, `services.json`, `schema_dump.sql`, `check-services.js`, `proxy.js*`, `auth.*.bak`, `setup-claude-skills.sh`

**Issue Description:**
1. **`next-auth@5.0.0-beta.30`** is installed but never imported — Supabase Auth is used exclusively
2. **`bcryptjs`** is installed but no file imports it
3. **7 Python scripts** (`refactor_*.py`) in root are one-time migration tools, not part of the app
4. **3 log files**, 3 `.bak` files, and various utility scripts clutter the project root
5. **24+ scripts/** files are one-time debug/seed scripts that should be documented or removed

**Impact:**
- `next-auth` adds ~200KB to bundle analysis
- Cluttered root directory makes project harder to navigate
- `.bak` files suggest incomplete migrations

**Proposed Solution:**
1. Remove `next-auth` and `bcryptjs` from dependencies
2. Move or delete Python refactor scripts (they've served their purpose)
3. Delete log files and `.bak` files
4. Move `proxy.js` to `scripts/` if still needed
5. `.gitignore` log files

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** None

---

### [9] Dashboard Has Divergent Data-Fetching Patterns

**Status:** ⬜ Pending (not started)

**Category:** Architecture

**Severity:** Medium

**Context:**
Files: `app/admin/dashboard/page.jsx`, `lib/actions/dashboard-actions.js`, `lib/actions/booking-actions.js` (getDashboardStats)

**Issue Description:**
Dashboard statistics are fetched via three different approaches:
1. `dashboard/page.jsx` — Direct inline Supabase queries with `Promise.all()` (used)
2. `lib/actions/dashboard-actions.js` — `getDashboardMetrics()` server action (exists but may not be used)
3. `lib/actions/booking-actions.js` — `getDashboardStats()` server action (exists, different status arrays)

Each defines **different status groupings** for "active", "pending", and "completed" bookings:
- `page.jsx` uses: `['confirmed', 'in_progress']` for active
- `booking-actions.js` uses: `['pet_collected', 'airport_checkin', 'departed', 'in_transit', 'arrived_clearing']` for active
- `dashboard-actions.js` uses: `['in_transit', 'picked_up', 'out_for_delivery']` for in-transit

**Impact:**
- Dashboard shows different numbers depending on which function is called
- Status groupings are hardcoded in 3 places — changes require finding all instances
- Confusion about what "active" means

**Proposed Solution:**
1. Define status groupings as constants in a single `lib/constants/booking-statuses.ts` file
2. Consolidate to one `getDashboardStats()` function
3. Remove unused dashboard action files

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** None (data accuracy improvement)

---

### [10] Users Page Is Client Component Doing Auth on Client Side

**Status:** ⬜ Pending (not started)

**Category:** Security

**Severity:** High

**Context:**
File: `app/admin/users/page.js`

**Issue Description:**
The entire users page is a `'use client'` component that:
1. Uses `supabase.auth.getSession()` on the client (deprecated, insecure — should use `getUser()`)
2. Fetches user role from the `profiles` table on the client side
3. Uses client-side role checks (`isAdmin`) to show/hide edit and delete buttons
4. Has `console.log('Session:', session)` debug statements in production code

Any user can bypass the client-side `isAdmin` check by directly calling the server actions.

**Impact:**
- Role-based UI restrictions are cosmetic only
- Session data logged to browser console
- `getSession()` is deprecated in Supabase — should use `getUser()` for security

**Proposed Solution:**
1. Convert to Server Component with server-side auth check
2. Move role checking to the server (admin layout already has user data)
3. Pass `isAdmin` as a prop from the server component
4. Remove all `console.log` debug statements
5. The server actions (`deleteUser`, etc.) already check auth — but should also verify admin role

**Estimated Effort:** Medium

**Dependencies:** Item #1 (middleware) provides the safety net

**Visual Impact:** None (preserves existing UI)

---

### [11] Booking API Does Not Use Database Transactions

**Status:** ⬜ Pending (not started)

**Category:** Database & Queries

**Severity:** Medium

**Context:**
File: `app/api/booking/route.js` (lines 119-234)

**Issue Description:**
The booking creation flow executes 4+ sequential database operations (create customer, create booking, create pets, link services) without wrapping them in a transaction. If any step fails midway, the database is left in an inconsistent state — e.g., a customer record with no booking, or a booking with no pets.

**Impact:**
- Partial data can be created on failure
- No rollback mechanism
- Orphaned records accumulate over time

**Proposed Solution:**
Use Supabase's RPC or a PostgreSQL function to wrap the creation flow in a single transaction. Alternatively, use the admin client's ability to perform multi-step operations and add cleanup logic on failure.

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None

---

### [12] Travel Details Parsed from `internal_notes` via Regex

**Status:** ⬜ Pending (not started)

**Category:** Architecture

**Severity:** Medium

**Context:**
File: `lib/actions/admin-booking-actions.js` (lines 114-125)

**Issue Description:**
The admin booking detail view extracts origin/destination from `internal_notes` using regex: `notes.match(/Origin: (.*?) \((.*?)\)/)`. The booking table has proper `origin_node_id` and `destination_node_id` foreign keys, as well as `origin_raw` and `destination_raw` JSON columns. The regex approach is a fragile fallback that breaks if note format changes.

**Impact:**
- Travel details show "Unknown" if notes don't match the regex pattern
- Proper relational data in `origin_node_id`/`destination_node_id` is ignored
- The `origin_raw` JSON column (used by `booking-actions.js`) is also ignored here

**Proposed Solution:**
Use `origin_raw`/`destination_raw` JSON columns as primary source (matching `booking-actions.js` approach), fall back to `origin_node_id` join if available, and remove regex parsing entirely.

**Estimated Effort:** Small

**Dependencies:** Item #2 (unified mapper)

**Visual Impact:** None (fixes data display)

---

### [13] S3 Upload Uses `ACL: 'public-read'` — Security Risk

**Status:** ⬜ Pending (not started)

**Category:** Security

**Severity:** Medium

**Context:**
File: `lib/storage-service.js` (line 69)

**Issue Description:**
The S3 upload function sets `ACL: 'public-read'` on all uploaded files, including sensitive documents like passports, vaccination records, and rabies certificates. These are private legal documents that should never be publicly accessible.

**Impact:**
- Anyone with the S3 URL can access passport and medical documents
- Violates data privacy regulations (GDPR, UAE PDPL)
- No access control on sensitive uploads

**Proposed Solution:**
1. Remove `ACL: 'public-read'` for document uploads
2. Use pre-signed URLs (already implemented in `app/api/upload/presigned/route.js`) for document access
3. Keep `public-read` only for non-sensitive assets like pet photos (if desired)
4. Separate upload functions for public vs private files

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** None

---

### [14] Color System Dual Definition

**Status:** ⬜ Pending (not started)

**Category:** Code Quality

**Severity:** Low

**Context:**
File: `app/globals.css` (lines 65-95 `@theme` block + lines 97-164 `:root` block), `tailwind.config.mjs`

**Issue Description:**
Color tokens are defined **three times**:
1. In `@theme {}` block (Tailwind v4 native theming)
2. In `:root {}` CSS custom properties (for `oklch(var(--...))` usage)
3. In `tailwind.config.mjs` `extend.colors` (for Tailwind class names)

This triple-definition means any color change must be made in 3 places.

**Impact:**
- Color changes require 3 edits
- Risk of drift between definitions
- Confusing for new developers

**Proposed Solution:**
Migrate fully to Tailwind v4's `@theme` system, which auto-generates both CSS variables and utility classes. Remove the `:root` duplicates and simplify `tailwind.config.mjs`.

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** Must verify no visual changes — colors should remain identical

---

### [15] Inconsistent File Extensions (.js vs .ts, .jsx vs .tsx)

**Status:** ⬜ Pending (not started)

**Category:** Code Quality

**Severity:** Low

**Context:**
Entire codebase: ~80% `.js`/`.jsx`, ~20% `.ts`/`.tsx`

**Issue Description:**
TypeScript and JavaScript files are mixed without clear pattern:
- Pages: mix of `.js`, `.jsx`, `.tsx`
- Components: mostly `.jsx`, some `.tsx`
- Server actions: mostly `.js`, one `.ts` (`manageUser.ts`)
- Hooks: all `.ts`
- Utils: mix

`tsconfig.json` exists with `strict: false` (not strict mode).

**Impact:**
- No type safety on ~80% of codebase
- IDE autocompletion and refactoring tools less effective
- Inconsistent developer experience

**Proposed Solution:**
Adopt incremental TypeScript migration:
1. Enable `strict: true` in `tsconfig.json`
2. Rename files to `.tsx`/`.ts` starting with shared modules (lib/, hooks/, types/)
3. Add types to server actions first (they're the API boundary)
4. Add a CI check preventing new `.js` files

**Estimated Effort:** Large (phased over time)

**Dependencies:** None

**Visual Impact:** None

---

## 4. Prioritization

### Critical Priority (Fix Immediately)
- [ ] Item #1: No Active Middleware — Admin Routes Unprotected
- [ ] Item #4: Public Booking API Has No Rate Limiting or Server-Side Validation

### High Priority (Fix Soon)
- [ ] Item #5: Supabase Admin Client Singleton Security
- [ ] Item #10: Users Page Client-Side Auth
- [ ] Item #2: Duplicate Booking Data-Mapping Functions
- [ ] Item #3: `manageUser.ts` Uses `any` Types
- [ ] Item #6: No Error Boundaries
- [ ] Item #7: Zero Automated Tests
- [ ] Item #13: S3 Upload `public-read` on Private Documents

### Medium Priority (Plan for Next Sprint)
- [ ] Item #9: Dashboard Divergent Data-Fetching
- [ ] Item #11: Booking API No Transactions
- [ ] Item #12: Travel Details Parsed from Regex
- [ ] Item #8: Unused Dependencies and Root Clutter

### Low Priority (Nice to Have)
- [ ] Item #14: Color System Dual Definition
- [ ] Item #15: Incremental TypeScript Migration

---

## 5. Refactor Roadmap

### Phase A: Foundation Fixes (Security & Stability)
Items: #1, #4, #5, #13, #6

These must be done first — they address security vulnerabilities and application stability. The middleware (#1) is the single most critical fix as it gates all subsequent admin security.

### Phase B: Core Improvements (Architecture & Quality)
Items: #2, #3, #9, #10, #11, #12

Consolidating data mappers (#2) should happen before adding tests (#7), as it reduces the surface area to test. The users page (#10) and dashboard (#9) fixes improve data integrity.

### Phase C: Polish & Optimization (Testing & DX)
Items: #7, #8, #14, #15

Testing (#7) comes after architecture fixes so tests are written against the clean codebase. Cleanup (#8) and TypeScript migration (#15) are ongoing background improvements.

---

## 6. Open Questions

1. **Is the `next-auth` dependency intentionally kept?** — It's installed but unused. Should it be removed, or is there a plan to migrate from Supabase Auth?
2. **Are the Python refactor scripts still needed?** — 7 Python scripts in root appear to be one-time color migration tools.
3. **What is the target for the S3 document storage?** — Should all documents use Supabase Storage instead of S3, or maintain the dual-provider approach?
4. **Is there a staging environment?** — The deployment docs reference Vercel but no staging branch protection is configured.
5. **Should the `/enquiry-old/page.js` route be removed?** — It appears to be a superseded version of the enquiry form.

---

## 7. Next Steps

To proceed with refactoring, please:

1. Review this document thoroughly
2. Reply with the item numbers you want to execute
   - Example: "Start with points 1, 4, and 5"
   - Example: "Execute items 1-6"
3. I will then implement ONLY the approved items

**Remember:** I will not modify any code until you explicitly approve specific items.

---

## Appendix A: Files Analyzed

**Configuration:** `package.json`, `next.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `jsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.env.local` (key names only), `.gitignore`

**App Layer:** `app/layout.js`, `app/page.js`, `app/globals.css`, `app/login/page.js`, `app/enquiry/page.js`, `app/services/page.js`, `app/admin/layout.js`, `app/admin/page.jsx`, `app/admin/dashboard/page.jsx`, `app/admin/relocations/page.js`, `app/admin/relocations/[id]/page.js`, `app/admin/users/page.js`, `app/admin/users/[userId]/page.tsx`, `app/admin/users/[userId]/UserForm.tsx`, `app/admin/services/page.jsx`, `app/admin/quotes/page.tsx`, `app/api/booking/route.js`, `app/api/tools/identify-breed/route.ts`, `app/api/upload/presigned/route.js`, `app/api/health/route.js`, `app/auth/actions.js`, `app/auth/callback/route.js`

**Lib Layer:** `lib/supabase/server.js`, `lib/supabase/client.js`, `lib/supabase/admin.js`, `lib/actions/booking-actions.js`, `lib/actions/admin-booking-actions.js`, `lib/actions/user-actions.js`, `lib/actions/manageUser.ts`, `lib/actions/service-actions.js`, `lib/actions/dashboard-actions.js`, `lib/audit-logger.js`, `lib/schemas.ts`, `lib/store/booking-store.js`, `lib/storage-service.js`, `lib/services/storage.js`

**Components:** `components/Providers.js`, `components/layouts/AdminLayout.jsx`, `components/booking/BookingWizard.jsx`, `components/admin/AdminHeader.jsx`

**Database:** `supabase/sql/08_bookings.sql`, `supabase/sql/12_rls.sql`, all migration files

**Middleware:** `middleware.js.bak_debug`, `middleware.js.bak_old`

**Other:** `utils/bookingLogic.ts`, `types/service.ts`, `hooks/useAvailableServices.ts`

## Appendix B: Tech Stack Detected

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.8 |
| Language | JavaScript + TypeScript (mixed) | TS 5.9.3 |
| Styling | Tailwind CSS v4 | ^4 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.89.0 |
| Auth | Supabase Auth (via @supabase/ssr) | 0.8.0 |
| State | Zustand (persisted) | 5.0.9 |
| Forms | React Hook Form + Zod | 7.70.0 / 4.3.5 |
| Storage | AWS S3 + Supabase Storage (dual) | — |
| Email | Nodemailer | 7.0.11 |
| AI | OpenAI GPT-4o (breed detection) | 6.15.0 |
| Charts | Recharts | 3.6.0 |
| Animation | Framer Motion | 12.23.26 |
| Icons | Lucide React | 0.556.0 |
| Deployment | Vercel (standalone) | — |
| Unused | next-auth, bcryptjs | — |
