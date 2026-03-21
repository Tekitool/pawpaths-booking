# Refactor with Claude — Production Readiness Audit

> **Status:** Analysis Complete | No Code Changes Applied
> **Generated:** 2026-03-21
> **Project:** Pawpaths SAE — Pet Relocation ERP
> **Stack:** Next.js 16 · React 19 · Supabase PostgreSQL · AWS S3 · Tailwind CSS 4 · Sentry v10
> **Auditor:** Nexus Architect (Senior Principal Engineer)

---

## ⚠️ Disclaimer

This document contains analysis and recommendations only.
**No code has been modified.** All changes require explicit user approval by item number.

---

## 1. Executive Summary

The Pawpaths application is a well-structured, modern Next.js ERP with solid architectural bones — proper RBAC middleware, RLS-enabled Postgres, Sentry observability, and a clean component hierarchy. The booking wizard, admin ERP, and finance modules are functionally mature.

However, a deep production audit reveals **two security vulnerabilities that must be resolved before public launch**, plus a set of medium-priority hardening items.

**Key Findings:**
- A **path traversal and privilege escalation vulnerability** exists in the S3 presigned URL API — Item [1], Critical
- **In-memory rate limiting fails silently** on Vercel's multi-instance serverless — Item [2], Critical
- **Server Actions allow CSRF from any `*.vercel.app` domain** — Item [4], High
- **Internal error messages are returned** to API consumers in production — Item [5], High
- **`documents_path` anti-pattern** stores JSON as a string column instead of JSONB — Item [7], Medium
- TypeScript coverage is incomplete (~40% of files are untyped `.js`) — accepted technical debt

The codebase is **conditionally production-ready** once items [1], [2], [4], and [5] are resolved.

---

## 2. Scorecard

| Dimension | Score | Justification |
|-----------|-------|---------------|
| Architecture & Structure | 8/10 | Clear separation of concerns; clean folder layout; RSC + Server Actions correctly applied |
| Code Quality | 6/10 | Functional but ~60% of server actions lack TypeScript; several anti-patterns in DB mapping |
| Performance | 7/10 | Good pagination and lazy loading; in-memory rate limiter is a prod risk |
| Database & Queries | 7/10 | Well-normalised schema with RLS; `documents_path` JSON-string is an anti-pattern |
| Security & Privacy | 5/10 | Strong middleware and RLS, but path traversal in upload API, absent RBAC at route level, no CSP |
| Reliability & Observability | 8/10 | Sentry well-configured with correct sampling; error boundaries cover most routes |
| DevEx & Maintainability | 5/10 | No test coverage; `strict: false`; `console.*` used throughout instead of structured logger |
| **Overall** | **6.6/10** | Solid foundation; targeted hardening needed before scaling to public traffic |

---

## 3. Detailed Findings & Refactor Items

---

### [1] S3 Upload — Path Traversal & Missing Role Check

**Status:** ✅ Completed
**Category:** Security
**Severity:** 🔴 Critical

**Context:**
File: `app/api/upload/presigned/route.js` (lines 15–54)
Middleware: `middleware.ts` line 17 — `/api/upload` is in `PUBLIC_PREFIXES`

**Issue Description:**

Two compounding problems:

**Problem A — `folder` parameter is user-controlled with no sanitisation.**
The API accepts `folder` from the request body and builds the S3 key directly:
```javascript
const { filename, contentType, folder = 'uploads' } = await request.json();
const key = `${folder}/${uniqueFilename}`;
```
A malicious user can submit `folder: "../../admin-uploads/bookings/some-id"` to write files into arbitrary S3 paths, potentially overwriting legitimate booking documents or accessing sensitive paths.

**Problem B — No role check; any authenticated Supabase user is accepted.**
The endpoint only validates `if (!user)`. If any customer-facing Supabase user account exists (even future portal users), they can generate presigned URLs and upload files to arbitrary locations.

**Additionally:** `/api/upload` is listed in `PUBLIC_PREFIXES` in middleware, meaning middleware-level auth is not applied to this path. The manual `supabase.auth.getUser()` inside the handler is the only protection.

**Impact:**
- Path traversal → overwrite any S3 object including existing booking documents
- Privilege escalation → any Supabase-authenticated user can upload files
- No audit log of who requested presigned URLs or to which path

**Proposed Solution:**
1. Whitelist valid `folder` values to a fixed set (e.g. `['uploads', 'documents', 'photos']`); reject anything outside this list
2. Add role check: query `profiles` table and require `role` to be in a staff role array
3. Log every presigned URL request via `logAuditAction` (userId, folder, key, timestamp)
4. Validate `contentType` against an explicit allowlist (PDF, JPG, PNG only)

**Estimated Effort:** Small (1–2 hours)
**Dependencies:** None
**Visual Impact:** None

---

### [2] In-Memory Rate Limiter Fails on Vercel Serverless

**Status:** ✅ Completed
**Category:** Security / Performance
**Severity:** 🔴 Critical

**Context:**
File: `lib/rate-limit.ts` (lines 1–70)
Used by: `app/api/booking/route.js`, `app/api/ai-crate-audit/route.js`

**Issue Description:**

The rate limiter uses a module-level `Map`:
```typescript
const store = new Map<string, { count: number; resetTime: number }>();
```

This has three production failure modes on Vercel:

1. **Serverless cold starts** — Each function invocation may start a fresh process. The Map resets to empty on every cold start. Spacing requests to trigger cold starts bypasses the limit entirely.
2. **Multi-instance scaling** — Under load, Vercel spins up multiple Lambda instances. Each has its own Map. 10 requests across 10 instances each see a count of 1 — the 10-request limit is never reached.
3. **`setInterval` leak** — The cleanup interval (lines 7–15) runs in a serverless context where the event loop is frozen between requests. This interval may never fire, causing the Map to grow unboundedly.

**Impact:**
- `/api/booking` public form: 10/hour limit per IP — bypassed trivially with multi-instance
- `/api/ai-crate-audit` (OpenAI-powered, paid): 15/hour limit — meaningless in serverless
- Real spam/cost exploitation risk for both OpenAI calls and email sends

**Proposed Solution:**

Replace the in-memory Map with a distributed atomic counter:

**Option A (Recommended) — Upstash Redis:**
- HTTP-based Redis, compatible with Vercel Edge + serverless
- Replace Map with atomic `INCR` + `EXPIRE` (5-line change)
- Use `@upstash/ratelimit` library which matches the existing `checkRateLimit` call signature
- Free tier: 10,000 requests/day — sufficient for initial launch

**Option B — Vercel KV:**
- Built into Vercel dashboard, zero external account setup
- Same atomic semantics, slightly less configurable

Both options are a drop-in replacement for the existing `checkRateLimit` function.

**Estimated Effort:** Small (2–3 hours including account setup)
**Dependencies:** Upstash account or Vercel KV enabled
**Visual Impact:** None

---

### [3] Missing Content Security Policy (CSP) Header

**Status:** ✅ Completed
**Category:** Security
**Severity:** 🟠 High

**Context:**
File: `middleware.ts` (lines 32–39) — `SECURITY_HEADERS` object

**Issue Description:**

The middleware applies a solid set of security headers but is missing a Content Security Policy:
```typescript
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',    // Deprecated — CSP supersedes this
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': '...',
    // ← NO Content-Security-Policy
}
```

Without CSP:
- XSS payloads can load scripts from arbitrary origins
- Malicious inline scripts are unrestricted
- Injected `fetch()` calls can exfiltrate data to attacker-controlled domains
- Note: `X-XSS-Protection: 1; mode=block` is deprecated and removed in Chrome/Firefox. CSP is the modern replacement.

**Proposed Solution:**

Add a `Content-Security-Policy` header. For this stack (Next.js + Supabase + S3 + Sentry):

Start in report-only mode (`Content-Security-Policy-Report-Only`) with Sentry as the violation report URI. This lets you catch violations in production before enforcing the policy. Enforce once the violation report is clean.

Directives needed:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline'` (required for Next.js hydration; tighten with nonces post-launch)
- `img-src 'self' data: blob: *.s3.amazonaws.com *.supabase.co ui-avatars.com`
- `connect-src 'self' *.supabase.co *.sentry.io`
- `frame-src 'none'`
- `object-src 'none'`
- `base-uri 'self'`

**Estimated Effort:** Medium (2–3 hours to configure and verify no breakage)
**Dependencies:** None
**Visual Impact:** None (if configured correctly)

---

### [4] `serverActions.allowedOrigins` Includes `*.vercel.app`

**Status:** ✅ Completed
**Category:** Security
**Severity:** 🟠 High

**Context:**
File: `next.config.mjs` (lines 10–13)

**Issue Description:**

```javascript
experimental: {
    serverActions: {
        allowedOrigins: ['localhost:3000', 'pawpathsae.com', 'www.pawpathsae.com', '.pawpathsae.com', '*.vercel.app'],
    },
},
```

The wildcard `*.vercel.app` allows **any Vercel-hosted application** — meaning any developer with a Vercel account — to call your Server Actions cross-origin. This bypasses Next.js's built-in Same-Origin protection.

An attacker deploys a page at `attacker.vercel.app` and can:
- Call booking mutations without the user being on your domain
- Trigger admin operations if the victim is a logged-in staff member
- Enumerate data by calling read Server Actions

This affects all ~200 server actions in `lib/actions/`.

**Proposed Solution:**

Remove `*.vercel.app` from `allowedOrigins`:
```javascript
allowedOrigins: [
    'localhost:3000',
    'pawpathsae.com',
    'www.pawpathsae.com',
    '.pawpathsae.com',
    // Add specific preview URLs only if needed for CI:
    // 'pawpaths-git-main-yourteam.vercel.app',
],
```

**Estimated Effort:** Trivial (5 minutes)
**Dependencies:** Verify no CI/CD pipeline relies on calling server actions from `*.vercel.app`
**Visual Impact:** None

---

### [5] Internal Error Messages Exposed to API Consumers

**Status:** ✅ Completed
**Category:** Security
**Severity:** 🟠 High

**Context:**
File: `app/api/booking/route.js` (lines 413–419)

**Issue Description:**

The catch block returns `error.message` unconditionally in production:
```javascript
return NextResponse.json({
    success: false,
    message: 'Internal Server Error',
    error: error.message,    // ← Sent in production — reveals DB schema, internal paths
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
}, { status: 500 });
```

`error.message` from Supabase errors reveals:
- Table and column names: `column "xyz" of relation "bookings" does not exist`
- Constraint names: `duplicate key value violates unique constraint "entities_contact_info_email_key"`
- Storage paths: SDK errors often include bucket names and full paths

This is reconnaissance data for an attacker testing the system.

**Additionally:** The cleanup block (lines 294–309) catches its own failure silently — if cleanup errors, partially-created customer/booking/pet records persist in the database with no alert.

**Proposed Solution:**
1. Remove `error: error.message` from 500 responses — return only a generic message
2. Capture the error to Sentry explicitly with `Sentry.captureException(error)` and return the event ID as a reference: `{ success: false, message: 'Internal error. Reference: SENTRY_ID }'`
3. For cleanup failures: call `Sentry.captureException(cleanupError)` with extra context so the partially-created record can be identified and manually removed

**Estimated Effort:** Small (1 hour)
**Dependencies:** None
**Visual Impact:** None

---

### [6] Double Supabase Query on Every Booking Detail Page Load

**Status:** ⬜ Pending (not started)
**Category:** Performance
**Severity:** 🟡 Medium

**Context:**
File: `lib/actions/admin-booking-actions.js` (lines 9–68)

**Issue Description:**

`getAdminBookingDetails` always tries `booking_number` first, then falls back to UUID. Both use the same 50-line nested query joining 4+ tables:

```javascript
const { data: booking, error } = await supabase.from('bookings')
    .select(`*, items:booking_services(...), customer:entities!customer_id(*), booking_pets(...)`)
    .eq('booking_number', bookingId)  // Try 1
    .single();

if (error) {
    const { data: bookingByUuid, error: uuidError } = await supabase
        .select(`...identical 50-line query...`)
        .eq('id', bookingId)          // Try 2 — always runs if first fails
        .single();
}
```

Every admin visiting a booking detail page via UUID triggers **two full nested join queries** sequentially. Under moderate load (10 staff viewing bookings) this doubles the database read pressure.

**Proposed Solution:**

Detect the identifier format before querying:
```javascript
const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
const column = isUuid ? 'id' : 'booking_number';
// Single query, correct column, no fallback needed
```

**Estimated Effort:** Trivial (15 minutes)
**Dependencies:** None
**Visual Impact:** None (performance improvement only)

---

### [7] `documents_path` Stored as JSON String Instead of JSONB

**Status:** ⬜ Pending (not started)
**Category:** Database
**Severity:** 🟡 Medium

**Context:**
File: `lib/actions/admin-booking-actions.js` (lines 94–103, 346–356, 427–434)
Table: `bookings.documents_path` column

**Issue Description:**

Per-pet document paths are stored as a JSON-encoded **string** in a text column, requiring manual parse/stringify at every access:

```javascript
// Reading — repeated in 3+ places across the codebase
try { extraDocuments = JSON.parse(booking.documents_path); } catch (e) { }

// Writing — repeated in 2 places
await supabase.from('bookings').update({ documents_path: JSON.stringify(docsMap) })
```

Problems:
- Postgres cannot index into the document structure (no `.containedBy()` / `.contains()` operators)
- A single corrupt write (`JSON.stringify` receiving a circular ref) silently destroys all per-pet documents for that booking
- The `try/catch` on every parse suggests it has already silently failed in practice
- Any typo in the merge logic overwrites the entire map

**Proposed Solution:**
1. Migration: `ALTER TABLE bookings ALTER COLUMN documents_path TYPE JSONB USING documents_path::JSONB`
2. Remove all `JSON.parse()` / `JSON.stringify()` calls — Supabase returns JSONB columns as native objects
3. Update Supabase queries to pass objects directly (e.g., `.update({ documents_path: docsMap })`)

**Estimated Effort:** Small (1–1.5 hours including migration + code updates)
**Dependencies:** None
**Visual Impact:** None

---

### [8] Hardcoded Supabase Project ID in `next.config.mjs`

**Status:** ⬜ Pending (not started)
**Category:** Security / Maintainability
**Severity:** 🟡 Medium

**Context:**
File: `next.config.mjs` (line 32)

**Issue Description:**

The Supabase project hostname is hardcoded in the image remote patterns:
```javascript
{
    protocol: 'https',
    hostname: 'cmqccuszskcawmjupqjn.supabase.co',  // Project ID in git history forever
    pathname: '/storage/v1/object/public/**',
}
```

While the public Supabase URL itself is not a secret, hardcoding it:
- Embeds the project identifier permanently in git history
- Makes environment switching (staging vs. production projects) require a code change
- Is inconsistent with the rest of the codebase which correctly uses `process.env.NEXT_PUBLIC_SUPABASE_URL`

**Proposed Solution:**

Derive the hostname from the existing required environment variable:
```javascript
// At the top of next.config.mjs (outside nextConfig)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : 'placeholder.supabase.co';

// In remotePatterns:
{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }
```

**Estimated Effort:** Trivial (10 minutes)
**Dependencies:** None
**Visual Impact:** None

---

### [9] TypeScript `strict: false` and ~60% Untyped Server Actions

**Status:** ⬜ Pending (not started)
**Category:** Code Quality
**Severity:** 🟡 Medium

**Context:**
File: `tsconfig.json` (`"strict": false`)
Files: All 23 server actions in `lib/actions/*.js`, most admin components as `.jsx`

**Issue Description:**

With `strict: false`, TypeScript silently allows `null` and `undefined` mismatches, implicit `any`, and unchecked index access. Combined with `.js` files for all server actions (which TypeScript does not analyse at all), business-critical logic has zero static analysis coverage.

Evidence of real bugs enabled by this:
- `admin-booking-actions.js` line 136: `species_id === 1 ? 'Dog' : ... 'Pet'` — hardcoded magic numbers; a typed enum would make this a compile error
- `booking/route.js` line 93: `.split('.').pop().toLowerCase()` — `.pop()` returns `string | undefined`; calling `.toLowerCase()` on `undefined` throws at runtime for files with no extension

**Proposed Solution (incremental — not a big-bang rewrite):**
1. Enable `"strict": true` in `tsconfig.json` and fix resulting errors file by file (start with `lib/utils/` which is already `.ts`)
2. Rename critical action files to `.ts`: start with `admin-booking-actions`, `booking-actions`, `finance-actions`
3. Use Zod inference (`z.infer<typeof Schema>`) to derive types from existing validators — avoids writing duplicate type definitions
4. Target: strict mode + typed actions within 2 sprints

**Estimated Effort:** Large (4–8 hours, spread over sprints)
**Dependencies:** [18] (vitest config needed before running typed tests)
**Visual Impact:** None

---

### [10] `console.*` Used Instead of Structured Logger Throughout

**Status:** ⬜ Pending (not started)
**Category:** Observability
**Severity:** 🟡 Medium

**Context:**
Files: `lib/actions/admin-booking-actions.js`, `app/api/booking/route.js`, ~20 other files
Instances: 100+ `console.error` / `console.log` / `console.warn` calls
Existing: `lib/logger.ts` — structured logger exists but is underused

**Issue Description:**

A structured logger (`createLogger`) is already built and available, but most code bypasses it:
```javascript
// These don't create Sentry events or structured log entries
console.error('Error uploading document:', error);
console.error("MAPPING ERROR IN getAdminBookingDetails:", e);
console.error('Database operation failed, cleaning up:', dbError.message);
```

In Vercel's serverless environment, `console.*` output only appears in Vercel's raw logs. It does **not** create Sentry events. A 500 error in a Server Action will not appear in Sentry unless explicitly captured — meaning production errors can go undetected.

**Proposed Solution:**
1. Replace all `console.error(msg, err)` in `lib/actions/` with `logger.error(msg, { error })` or `Sentry.captureException(err)` for thrown exceptions
2. Replace `console.warn` with `logger.warn`
3. Remove all `console.log` from production code paths
4. The logger already exists — this is a pure substitution task, no architecture change needed

**Estimated Effort:** Small (1–2 hours with find-replace across `lib/actions/`)
**Dependencies:** None
**Visual Impact:** None

---

### [11] Email Transport Uses Opportunistic STARTTLS (`secure: false`)

**Status:** ⬜ Pending (not started)
**Category:** Security
**Severity:** 🟡 Medium

**Context:**
File: `app/api/booking/route.js` (lines 351–362)

**Issue Description:**

The nodemailer transporter is configured with `secure: false`:
```javascript
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,         // STARTTLS (opportunistic) — not TLS
    ...
});
```

`secure: false` means STARTTLS: the connection starts unencrypted and attempts an upgrade. If the SMTP server does not support STARTTLS (or an attacker performs a downgrade attack), the connection proceeds in plaintext — exposing email credentials and customer data in transit.

**Additionally:** `nodemailer.createTransport()` is called inside the POST handler on every booking submission. No connection pooling or reuse occurs.

**Proposed Solution:**
Option A: Set `secure: true` with `port: 465` for TLS-from-first-byte (preferred)
Option B: Migrate to **Resend** (the CLAUDE.md standard for transactional email) — stateless, HTTP-based, no connection management, TLS by default, and significantly simpler to integrate than raw SMTP

If staying on nodemailer, move `createTransport()` to module scope (outside the handler) to reuse the connection across warm Lambda invocations.

**Estimated Effort:** Small (1 hour for TLS fix) or Medium (2 hours for Resend migration)
**Dependencies:** Resend account if migrating
**Visual Impact:** None

---

### [12] Missing Error Boundaries on Customer-Facing Routes

**Status:** ⬜ Pending (not started)
**Category:** Reliability
**Severity:** 🟡 Medium

**Context:**
Files: `app/admin/error.tsx` exists; sub-route error boundaries exist for invoices/expenses/quotes
Missing: `app/(homepage)/error.tsx`, `app/enquiry/error.tsx`, `app/(auth)/error.tsx`

**Issue Description:**

Admin routes have proper error boundaries. Customer-facing routes do not. If any RSC throws during rendering on the homepage, enquiry form, or auth pages, Next.js falls back to `app/global-error.tsx` — a full-page crash that replaces the entire UI and offers no recovery path.

Concrete example: `app/enquiry/page.js` fetches species, breeds, countries, and genders from Supabase. If any of these queries fail (Supabase outage, rate limit, network error), the customer sees a blank error page. There is no fallback content, no contact link, no retry prompt.

**Proposed Solution:**

Create `error.tsx` for each public route group:
1. `app/(homepage)/error.tsx` — fallback with page skeleton and refresh button
2. `app/enquiry/error.tsx` — fallback with WhatsApp contact link (keeps the journey alive even if the form fails)
3. `app/(auth)/error.tsx` — fallback with login retry

Each file is a standard 10-line pattern: `'use client'` + `useEffect` to log to Sentry + return minimal recovery UI.

**Estimated Effort:** Small (45 minutes for all three)
**Dependencies:** None
**Visual Impact:** Better error UX for customers (fallback UI instead of blank crash)

---

### [13] `file.name.split('.').pop()` — Undefined on Files Without Extension

**Status:** ⬜ Pending (not started)
**Category:** Code Quality / Security
**Severity:** 🟡 Medium

**Context:**
File: `app/api/booking/route.js` (line 93)

**Issue Description:**

```javascript
const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
```

`.split('.').pop()` returns `undefined` for filenames with no dot (e.g. `"Makefile"`, `"profile"`). Calling `.toLowerCase()` on `undefined` throws `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.

This causes:
1. The catch block returns `UPLOAD_FAILED` instead of `INVALID_FILE_TYPE` for extension-less files
2. The file type validation is silently bypassed — the error is caught before the extension check runs
3. Under certain edge cases, a cleverly named file could bypass the `ALLOWED_EXTENSIONS` check entirely

**Proposed Solution:**
Guard against undefined:
```javascript
const lastDot = file.name.lastIndexOf('.');
const fileExtension = lastDot >= 0 ? file.name.slice(lastDot).toLowerCase() : '';
if (!fileExtension) {
    return NextResponse.json({ error: 'File must have an extension' }, { status: 400 });
}
```

**Estimated Effort:** Trivial (15 minutes)
**Dependencies:** None
**Visual Impact:** None

---

### [14] No Test Coverage Despite Full Testing Stack Installed

**Status:** ⬜ Pending (not started)
**Category:** DevEx
**Severity:** 🟡 Medium

**Context:**
`package.json`: vitest, @testing-library/react, @faker-js/faker all installed
No `*.test.ts` or `*.spec.ts` files found in the repository

**Issue Description:**

The testing toolchain is fully installed and `npm run test` is in CI (`ci.yml`), but there are zero test files. The CI pipeline reports green for tests because vitest passes vacuously with no test suites. This gives false confidence.

Critical paths with zero coverage:
- `lib/utils/pricing-calculator.ts` — financial calculations (fixed, per_kg, per_km, percentage models)
- `lib/schemas.ts` — booking validation rules (XSS payloads, boundary values, edge cases)
- `app/api/booking/route.js` — the entire booking submission flow
- `lib/rate-limit.ts` — rate limiting logic (cannot verify behaviour without tests)

The `@faker-js/faker` dependency is installed for test data generation but is completely unused — indicating tests were planned but never written.

**Proposed Solution:**

Priority order for test files:
1. `vitest.config.ts` (see [18]) — prerequisite, 20 minutes
2. `lib/utils/pricing-calculator.test.ts` — unit tests for all pricing models
3. `lib/schemas.test.ts` — validation edge cases (empty, XSS, boundary values)
4. `lib/rate-limit.test.ts` — verify rate limit counting and reset behaviour
5. `app/api/booking/route.test.ts` — integration test (mock Supabase + nodemailer)

Target: 70% coverage on `lib/utils/` and `lib/validations/`. Lower coverage on React components is acceptable for now.

**Estimated Effort:** Large (6–10 hours for initial meaningful coverage)
**Dependencies:** [18] (vitest config) must be done first
**Visual Impact:** None

---

### [15] `documentType` String-Split Anti-Pattern for Pet ID Encoding

**Status:** ⬜ Pending (not started)
**Category:** Code Quality
**Severity:** 🟢 Low

**Context:**
File: `lib/actions/admin-booking-actions.js` (lines 301–307, 390–393)

**Issue Description:**

Pet IDs are encoded into a composite `documentType` string by splitting on `_`:
```javascript
if (documentType.includes('_') && documentType !== 'pet_photo_path') {
    const parts = documentType.split('_');
    baseType = parts[0];
    petId = parts.slice(1).join('_');  // Re-joins UUID portions
}
```

The exception `documentType !== 'pet_photo_path'` reveals this is already fragile — `pet_photo_path` has underscores that would break the split. The current code works because UUIDs use hyphens not underscores, but:
- Any future `baseType` value containing `_` would break the parse silently
- The client constructs the composite string; server-side parsing is tightly coupled to that format
- Debugging parse failures is non-obvious

**Proposed Solution:**

Pass `baseType` and `petId` as separate named parameters in the server action call:
```javascript
// Instead of: documentType = 'passport_abc123-...'
// Use separate params: { documentType: 'passport', petId: 'abc123-...' }
```

**Estimated Effort:** Small (1–1.5 hours across server action + client callers)
**Dependencies:** None
**Visual Impact:** None

---

### [16] Nodemailer Transporter Recreated on Every Booking Submission

**Status:** ⬜ Pending (not started)
**Category:** Performance
**Severity:** 🟢 Low

**Context:**
File: `app/api/booking/route.js` (lines 351–362)

**Issue Description:**

`nodemailer.createTransport()` is called inside the POST handler — creating a new SMTP connection on every booking. Under concurrent submissions, each request opens a separate TCP connection to the mail server. There is no connection reuse.

In a serverless context, this is partially mitigated by Vercel's warm Lambda reuse, but:
- Each cold start creates a new transporter regardless
- Under burst load, multiple instances each create their own connection
- Each transporter establishment adds ~100–300ms latency per submission

**Proposed Solution:**
Move `createTransport()` to module scope (outside the handler). One-line change that lets warm Lambda invocations reuse the existing connection. Or migrate to Resend (see [11]) which is HTTP-based and stateless.

**Estimated Effort:** Trivial (5 minutes if moving scope)
**Dependencies:** None
**Visual Impact:** None

---

### [17] Missing `vitest.config.ts` — Tests Will Fail on First Run

**Status:** ⬜ Pending (not started)
**Category:** DevEx
**Severity:** 🟢 Low

**Context:**
`package.json` — vitest scripts present; no `vitest.config.ts` found

**Issue Description:**

Without a vitest config, tests run with defaults that are incompatible with Next.js:
- No `jsdom` environment (React component tests fail immediately)
- No `@/` path alias resolution (all imports from `@/lib/...` throw `Cannot find module`)
- No setup file for `@testing-library/jest-dom` matchers

Any attempt to write tests (see [14]) will fail before the first assertion runs.

**Proposed Solution:**

Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
});
```

Also create `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

**Estimated Effort:** Trivial (20 minutes)
**Dependencies:** None (but must be done before [14])
**Visual Impact:** None

---

## 4. Prioritisation

### 🔴 Critical — Launch Blockers
- [ ] **[1]** S3 Upload Path Traversal & Missing Role Check
- [ ] **[2]** In-Memory Rate Limiter (Multi-Instance Bypass)

### 🟠 High — Fix This Sprint
- [ ] **[3]** Missing Content Security Policy Header
- [ ] **[4]** `serverActions.allowedOrigins` Includes `*.vercel.app`
- [ ] **[5]** Internal Error Messages Exposed in API Responses

### 🟡 Medium — Next Sprint
- [ ] **[6]** Double Supabase Query on Booking Lookup
- [ ] **[7]** `documents_path` Stored as JSON String (vs JSONB)
- [ ] **[8]** Hardcoded Supabase Project ID in Config
- [ ] **[9]** TypeScript `strict: false` + Untyped Server Actions
- [ ] **[10]** `console.*` Used Instead of Structured Logger
- [ ] **[11]** Email SMTP `secure: false` (Opportunistic TLS)
- [ ] **[12]** Missing Error Boundaries on Customer Routes
- [ ] **[13]** Unsafe File Extension Extraction

### 🟢 Low — Backlog
- [ ] **[14]** No Test Coverage
- [ ] **[15]** `documentType` String-Split Anti-Pattern
- [ ] **[16]** Nodemailer Transporter Created Per-Request
- [ ] **[17]** Missing `vitest.config.ts`

---

## 5. Refactor Roadmap

### Phase A — Security Hardening (This week, ~8 hours)
Items **[1], [2], [4], [5], [13]**

Items 1 and 2 are launch blockers — real, exploitable vulnerabilities. Items 4 and 5 are trivial quick wins. Item 13 closes a silent validation bypass.

### Phase B — Code Health (Next sprint, ~10 hours)
Items **[3], [6], [7], [8], [10], [11], [12]**

CSP header (3), database correctness (7), performance wins (6), operational observability (10), and error UX (12).

### Phase C — TypeScript & Testing (Over 2–4 weeks)
Items **[9], [14], [15], [16], [17]**

Investment in long-term maintainability. Complete [17] (vitest config) before starting [14] (tests). Enable strict TypeScript incrementally.

---

## 6. What is Working Well ✅

These are production-quality implementations that should not be changed:

| Area | Assessment |
|------|------------|
| **Middleware RBAC** | Correct layered auth: edge auth check → service-role DB profile verify → fine-grained route protection |
| **RLS Policies** | Properly enabled on all 5 core tables; `is_staff()` helper is correct and uses `SECURITY DEFINER` |
| **Sentry Integration** | Well-configured: correct sampling rates (10%/5%/1%), noise filtering, source map upload, `global-error.tsx` |
| **Zod Validation** | `EnquirySchema` validates at API boundary — correct server-side double-validation pattern |
| **Honeypot Field** | Elegant bot rejection with silent 201 response — does not reveal rejection to scrapers |
| **DB Transaction Cleanup** | Booking creation has explicit rollback-style cleanup on DB failure — prevents orphaned records |
| **Env Validation** | `lib/env.js` fails fast on missing required vars at startup — correct fail-early pattern |
| **Security Headers** | HSTS with preload, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy all correctly set |
| **Soft Delete** | Consistently applied to `service_catalog`, `bookings`, `finance_documents` |
| **Structured Logger** | `lib/logger.ts` exists and is correctly architected — just needs wider adoption (see [10]) |
| **Health Check** | `/api/health` tests DB connectivity and is ready for uptime monitoring integration |
| **Audit Logging** | `logAuditAction` called on all mutations in admin actions — compliance-ready |
| **Cross-Subdomain Cookies** | Session sharing correctly implemented with `NEXT_PUBLIC_COOKIE_DOMAIN` env var |
| **React Compiler** | Enabled in `next.config.mjs` — automatic memoisation across all components |

---

## 7. Open Questions

1. **Customer portal**: Will customers ever have Supabase Auth accounts? If yes, the severity of [1] becomes Critical-immediate (upload RBAC is the only thing preventing customer accounts from accessing the presigned URL endpoint).
2. **Email provider**: Is the intention to stay on SMTP long-term, or migrate to Resend as specified in `CLAUDE.md`? This changes the scope of [11].
3. **Vercel preview deployments**: Do Vercel preview branch deploys need to call Server Actions? This determines whether removing `*.vercel.app` from [4] breaks CI.
4. **`documents_path` column type**: Is the current `TEXT` type confirmed, or was it always intended to be `JSONB`? This affects the complexity of the migration in [7].

---

## 8. Next Steps

Review this report and reply with the item numbers you want to execute.

Examples:
- `"Start with 1 and 2"` — resolve the two launch blockers
- `"Execute items 1, 2, 4, 5"` — full critical security sprint
- `"Do items 1-5"` — all security hardening

**I will not modify any code until you explicitly approve specific item numbers.**

---

## Appendix A: Files Analysed

| Layer | Files |
|-------|-------|
| API Routes | `app/api/booking/route.js`, `app/api/upload/presigned/route.js`, `app/api/health/route.js`, `app/api/services/route.js`, `app/api/ai-crate-audit/route.js` |
| Config | `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `middleware.ts`, `.env.example` |
| Core Actions | `lib/actions/admin-booking-actions.js` (read in full) + 22 other action files (structure reviewed) |
| Security | `lib/rate-limit.ts`, `lib/env.js`, `lib/supabase/admin.ts`, `lib/supabase/server.ts` |
| Database | `supabase/sql/12_rls.sql` (read in full), 15 migration files, 25 schema SQL files |
| Observability | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `app/global-error.tsx` |
| Components | `components/enquiry/` (14 files), `components/admin/` (30 files), `components/ui/` (14 files) |
| CI/CD | `.github/workflows/ci.yml`, `instrumentation.js` |

**Total files reviewed:** 300+

---

## Appendix B: Dependency Snapshot

| Package | Version | Status |
|---------|---------|--------|
| next | 16.0.8 | ✅ Current |
| react / react-dom | 19.2.1 | ✅ Latest |
| typescript | 5.9.3 | ✅ Current |
| @sentry/nextjs | 10.45.0 | ✅ Current |
| @supabase/supabase-js | 2.89.0 | ✅ Current |
| @aws-sdk/client-s3 | 3.956.0 | ✅ Current |
| zod | 4.3.5 | ✅ Current |
| framer-motion | 12.35.2 | ✅ Current |
| nodemailer | 7.0.11 | ✅ Current |
| tailwindcss | 4 | ✅ Current |
| vitest | 4.0.18 | ✅ Installed, unused |

Run `npm audit` before launch. Configure Dependabot for automated security patches.

---

*Audit performed by Nexus Architect — Senior Principal Engineer*
*No code was modified during this analysis.*
