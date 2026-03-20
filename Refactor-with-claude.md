# Refactor with Claude — Enterprise ERP Audit & Scale Plan

> **Status:** Analysis Complete | No Code Changes Applied
> **Generated:** 2026-03-19
> **Project:** Pawpaths Pet Relocation CRM → ERP
> **Current Completion:** ~60% (CRM) | ~15% (ERP-ready)
> **Auditor:** Claude (Nexus Architect)

---

## 1. Executive Overview

Pawpaths is a **functional mid-stage CRM** built on a solid Next.js 16 + Supabase foundation. The core booking pipeline (enquiry → delivery) works, user management is competent, and the database schema is surprisingly well-designed for an AI-generated codebase — 24 SQL files with proper enums, RLS policies, soft deletes, and audit trails.

**However, it is not an ERP.** The gap between "CRM that tracks bookings" and "ERP that runs a pet relocation business" is enormous. Here's the honest assessment:

**What Works Well:**
- Database schema is 80% ERP-ready (finance tables, task templates, communications already exist)
- Auth/RBAC foundation is solid (8 roles defined, RLS enforced, middleware guards admin routes)
- Booking lifecycle has 20 statuses — reflects real operational complexity
- Service catalog with 3-axis filtering (species × service_type × transport_mode) is production-grade
- AI tools (breed scanner, IATA crate audit) are genuinely differentiating

**What's Critically Missing:**
- No financial module (invoices/expenses/reports pages are all stubs — 14 lines each)
- No Kanban pipeline view (the single most impactful UX upgrade)
- No real-time anything (no Supabase Realtime subscriptions, no live notifications)
- No mobile optimization (tables break on phones, no bottom nav, no card views)
- Zero analytics/reporting (no charts, no KPIs, no revenue tracking)
- RBAC exists in schema but not enforced in UI (every role sees everything)
- 5 admin pages are empty stubs (Reports, Expenses, Invoices, Summary, Settings)
- Quote page uses 100% mock data — not connected to the database

**Key Observations:**
- The DB schema is ahead of the application — tables for finance, communications, tasks, and audit logs exist but have no UI
- Several components are dangerously large (ServicesTable: 15K chars, EditUserModal: 40K chars, BookingTable: 21K chars)
- Mixed data patterns (some pages use server components, others client-fetch, others server actions) — no consistent architecture

---

## 2. Scorecard

| # | Dimension | Score | Assessment |
|---|-----------|-------|------------|
| 1 | Operational Completeness | 4/10 | Core booking works; no quoting, tracking, dispatch, vet scheduling, or compliance workflows |
| 2 | Financial & Accounting | 1/10 | DB schema exists but zero UI implementation — all finance pages are 14-line stubs |
| 3 | UI/UX & Workflow Efficiency | 5/10 | Clean design language, but table-heavy, no Kanban, no command palette, slow data entry |
| 4 | Mobile-First Execution | 2/10 | Not tested or designed for mobile; tables overflow, no card views, no bottom nav |
| 5 | Architecture & Code Quality | 5/10 | Solid foundation but inconsistent patterns, oversized components, mixed fetching strategies |
| 6 | Database & Schema Design | 8/10 | Excellent relational design with proper enums, RLS, triggers, audit logs, and soft deletes |
| 7 | Security & RBAC | 5/10 | DB-level RLS and middleware auth are solid; UI-level RBAC not enforced, no field-level permissions |
| 8 | Performance & Scalability | 4/10 | No pagination logic (UI exists but disabled), no code splitting, no caching, client-side filtering |
| 9 | Reliability & Observability | 3/10 | No error boundaries, no loading skeletons on most pages, no health checks, minimal logging |
| 10 | DevEx & Maintainability | 4/10 | No tests, inconsistent file patterns, 5+ components exceed 500 lines, no CI/CD pipeline |
| | **Overall** | **4.1/10** | **Solid CRM prototype with excellent DB; needs massive feature buildout and architectural tightening to become ERP** |

---

## 3. Detailed Findings and Refactor Items

---

### PILLAR 1: OPERATIONAL COMPLETENESS (The Logistics Engine)

---

### [1] Kanban Pipeline Board for Active Relocations

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** Critical

**Context:**
- Currently: All relocations shown as a flat table in `app/admin/relocations/page.js`
- The 20-status booking lifecycle is already defined in `lib/constants/booking-statuses.ts` with proper groupings (PENDING, ACTIVE, IN_TRANSIT, COMPLETED, ACTION_REQUIRED, CLOSED)
- No visual pipeline exists — every booking looks the same regardless of urgency

**Issue Description:**
A pet relocation business lives and dies by its pipeline visibility. Operations managers need to see at a glance: How many leads? How many awaiting documents? How many in transit right now? The current flat table forces mental overhead to parse booking statuses from text badges.

**Impact:**
- Operations staff waste 30-60 seconds per lookup finding active work
- No visual urgency indicators for time-sensitive relocations (flight departures in <48h)
- Impossible to identify bottlenecks (e.g., 15 bookings stuck at "docs_pending")
- New staff cannot quickly learn the workflow

**Proposed Solution:**
Build a **drag-and-drop Kanban board** as the primary relocations view (table becomes secondary toggle).

Columns map to existing STATUS_GROUPS:
```
Lead → Quote Sent → Confirmed → Docs Prep → Flight Booked → In Transit → Delivered → Completed
```

Each card shows: Pet name + photo, Customer name, Route (DXB→LHR), Departure date, Days until departure (color-coded: green >7d, amber 3-7d, red <3d).

Drag-and-drop updates booking status via server action. Real-time sync via Supabase Realtime subscription.

Use `@dnd-kit/core` for accessible drag-drop (already works with React 19). Cards render as compact Tailwind cards with avatar, route badge, and countdown timer.

**Database Changes:** None — schema already supports all 20 statuses with STATUS_GROUPS mapping.

**Estimated Effort:** Large

**Dependencies:** None (can be built independently)

**Visual Impact:** Major — this becomes the primary operational view

---

### [2] Quotation Engine (Replace Mock Data)

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** Critical

**Context:**
- `app/admin/quotes/page.tsx` (367 lines) uses **100% hardcoded mock data** — 6 fake quotes
- `app/admin/quotes/create/page.tsx` (258 lines) has a form but doesn't save to database
- DB table `finance_documents` with `doc_type = 'quotation'` already exists in `supabase/sql/09_finance.sql`
- `finance_items` table exists for line items with auto-calculated `line_total`
- Auto-generated doc numbers exist (EST-2026-0001 format)

**Issue Description:**
The quotation system is the most critical business tool for a pet relocation company — it's how you close deals. Currently it's entirely fake. No real quotes can be created, sent, tracked, or converted to invoices.

**Impact:**
- Cannot generate quotes for customers (business-blocking)
- Cannot track quote-to-conversion rates
- Cannot set expiry dates and follow up on stale quotes
- Cannot convert accepted quotes to invoices (double data entry required)

**Proposed Solution:**
1. **Quote Builder:** Pull services from `service_catalog` based on booking context (export/import/local). Auto-populate line items with `base_price`. Allow override. Calculate totals with tax.
2. **Quote Lifecycle:** Draft → Sent (email via Resend) → Viewed → Accepted → Converted to Invoice → Expired
3. **Multi-Currency:** Support AED/USD/EUR with stored exchange rate at quote time
4. **PDF Generation:** Use existing `jspdf` + `jspdf-autotable` deps to generate branded quote PDFs
5. **Quote-to-Invoice Conversion:** One-click copy all line items from `finance_documents` (quotation) to new `finance_documents` (invoice)
6. **Server Actions:** `createQuote()`, `sendQuote()`, `acceptQuote()`, `convertToInvoice()`, `expireQuote()`

**Database Changes:**
- Add `expires_at`, `viewed_at`, `accepted_at` columns to `finance_documents`
- Add `converted_from_id` FK to link invoice back to source quote

**Estimated Effort:** Large

**Dependencies:** None

**Visual Impact:** Replaces mock UI with real data

---

### [3] Live Relocation Tracking Dashboard

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** High

**Context:**
- `app/admin/relocations/[id]/page.js` (282 lines) shows booking details but no timeline/tracking
- `booking_interactions` table exists with `action_type`, `note_content`, `is_internal`, `created_at`
- `communications` table exists for email/SMS/WhatsApp logging
- No real-time subscriptions anywhere in the codebase

**Issue Description:**
Once a booking is confirmed, operations need a live timeline showing every event: document received, flight booked, pet collected, customs cleared, delivered. Currently, there's a static detail page with no operational history.

**Impact:**
- Operations cannot see what happened on a booking without querying the database
- Customer service cannot answer "where is my pet?" calls
- No accountability trail (who did what, when?)
- Cannot identify delays or bottlenecks per booking

**Proposed Solution:**
Build an **Activity Timeline** component on the relocation detail page:

1. **Timeline Feed:** Chronological list of all `booking_interactions` + `communications` for this booking
2. **Quick Actions:** Status update buttons that auto-create interactions (e.g., "Mark Collected" → creates interaction + updates booking status)
3. **Internal vs External:** Toggle to show/hide internal notes (is_internal flag)
4. **Real-time Updates:** Supabase Realtime subscription on `booking_interactions` table filtered by `booking_id`
5. **Communication Hub:** Send email/WhatsApp directly from timeline (creates `communications` record)

**Database Changes:** None — `booking_interactions` and `communications` tables already exist with proper schema.

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** Adds timeline component to existing detail page

---

### [4] Veterinary & Compliance Schedule Timeline

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** High

**Context:**
- `task_templates` table exists with 15 seeded templates covering the full export journey
- Templates use `anchor_event` + `days_offset` for date calculation (e.g., "Vet consult: departure -30d")
- `tasks` table links to bookings with `due_date`, `status`, `assigned_to`
- `app/admin/tasks/page.js` (169 lines) shows a basic task list but no timeline visualization

**Issue Description:**
Pet relocation requires strict compliance timelines: rabies titer test (30+ days before), health certificate (within 10 days), import permit (varies by country), USDA endorsement (within 48 hours for US). Missing a single deadline can delay a relocation by months. Currently, tasks exist in the database but there's no visual timeline showing what's due and when.

**Impact:**
- Missed vet deadlines → relocation delays of weeks/months
- No proactive alerts for upcoming deadlines
- Coordinators must manually track compliance dates per booking
- No visibility into team workload across all active bookings

**Proposed Solution:**
1. **Auto-Task Generation:** When a booking is confirmed, auto-create tasks from `task_templates` based on `service_type`. Calculate due dates from `scheduled_departure_date + days_offset`.
2. **Gantt-Style Timeline:** Visual timeline per booking showing all compliance tasks with color-coded status (green=done, amber=due soon, red=overdue)
3. **Calendar Integration:** Push due tasks to the existing `app/admin/calendar/page.js` view
4. **Notification Triggers:** Alert assigned staff when tasks are due in 48h/24h/overdue
5. **Country-Specific Rules:** Add `country_requirements` table mapping destination countries to required documents/procedures

**Database Changes:**
- New `country_requirements` table: `id`, `country_id`, `requirement_type` (enum: import_permit, quarantine, blood_test, microchip, vaccination), `description`, `days_before_travel`, `is_mandatory`
- Add `auto_generated` boolean to `tasks` table

**Estimated Effort:** Large

**Dependencies:** Item [3] (timeline component is reused)

**Visual Impact:** Adds Gantt timeline to booking detail page

---

### [5] Dispatch & Driver Assignment Module

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** Medium

**Context:**
- `driver` role exists in the enum system
- No driver assignment UI or tracking exists
- No dispatch scheduling or route optimization

**Issue Description:**
Pet collection and delivery requires dispatching drivers with proper vehicles (temperature-controlled for certain routes). Currently, there's no way to assign drivers, track pickups/deliveries, or manage vehicle allocation.

**Impact:**
- Dispatch is done via WhatsApp/phone (error-prone, no audit trail)
- No proof of collection/delivery
- Cannot optimize routes or schedules
- Drivers have no mobile-friendly interface

**Proposed Solution:**
1. **Dispatch Board:** Kanban-style board showing today's pickups and deliveries by driver
2. **Driver Assignment:** Assign driver to booking from relocation detail page
3. **Driver Mobile View:** Simplified card-based view showing: address, contact, pet photo, special instructions, "Mark Collected" / "Mark Delivered" buttons
4. **Photo Proof:** Camera upload for proof of collection/delivery (use existing `uploadFile` service)
5. **SMS/WhatsApp Notification:** Auto-notify customer when driver is en route

**Database Changes:**
- New `dispatch_assignments` table: `id`, `booking_id`, `driver_id`, `assignment_type` (pickup/delivery), `scheduled_at`, `started_at`, `completed_at`, `proof_photo_path`, `notes`

**Estimated Effort:** Large

**Dependencies:** Item [1] (Kanban pattern reused)

**Visual Impact:** New page + driver mobile view

---

---

### PILLAR 2: FINANCIAL & ACCOUNTING ARCHITECTURE (The Ledger)

---

### [6] Invoice Generation & Management System

**Status:** ⬜ Pending (not started)

**Category:** Financial & Accounting

**Severity:** Critical

**Context:**
- `app/admin/invoices/page.jsx` is a **14-line stub** — completely empty
- `finance_documents` table exists with `doc_type` supporting: quotation, proforma_invoice, invoice, receipt, credit_note, debit_note, vendor_bill, expense_claim
- `finance_items` table exists for line items with auto-calculated totals
- Auto-generated doc numbers (INV-2026-0001) via trigger
- `jspdf` and `jspdf-autotable` are already in `package.json`

**Issue Description:**
You cannot run a business without invoicing. The database schema is fully ready for invoicing — doc number generation, line items, payment status tracking — but there is zero UI. No way to create, view, send, or track invoices.

**Impact:**
- Cannot invoice customers (business-blocking)
- Cannot track payments (paid_amount, balance_amount columns unused)
- Cannot generate PDF invoices for email/print
- Cannot reconcile revenue

**Proposed Solution:**
1. **Invoice List Page:** Table/card view with filters (status: draft/issued/paid/overdue), search, date range
2. **Invoice Detail Page:** Customer info, line items, totals, payment history, actions (send, record payment, void)
3. **Create Invoice:** From scratch or convert from quote (Item [2]). Pull services from booking. Auto-calculate tax.
4. **PDF Generation:** Branded PDF using `jspdf` with company logo, customer details, line items, bank details, terms
5. **Payment Recording:** Record full/partial payments against invoices. Auto-update `payment_status`.
6. **Email Delivery:** Send invoice PDF via email using existing Nodemailer/SMTP setup
7. **Multi-Currency:** Display in customer's preferred currency (stored in `entities.currency`)

**Database Changes:**
- Add `sent_at`, `paid_at` columns to `finance_documents`
- New `payments` table: `id`, `finance_doc_id`, `amount`, `currency`, `payment_method` (enum: bank_transfer, credit_card, cash, check), `reference`, `received_at`, `recorded_by`

**Estimated Effort:** Large

**Dependencies:** None (can work independently from quotes)

**Visual Impact:** Replaces 14-line stub with full invoice management

---

### [7] Expense & Supplier Cost Tracking

**Status:** ⬜ Pending (not started)

**Category:** Financial & Accounting

**Severity:** High

**Context:**
- `app/admin/expenses/page.jsx` is a **14-line stub**
- `finance_documents` supports `vendor_bill` and `expense_claim` doc_types
- `entities` table supports `is_vendor = true` for supplier records
- No expense tracking UI exists

**Issue Description:**
Every relocation has costs: vet fees, boarding charges, airline cargo fees, customs brokerage, crate manufacturing, ground transport. Without expense tracking, profit margins are invisible. You're flying blind.

**Impact:**
- Cannot calculate profit per relocation
- Cannot track what's owed to vendors
- Cannot forecast costs for quotes
- No visibility into cost drivers

**Proposed Solution:**
1. **Expense Entry:** Quick-add form: vendor (from entities where is_vendor=true), category, amount, currency, receipt upload, linked booking
2. **Expense Categories:** Vet fees, Airline cargo, Customs/permits, Crate/kennel, Boarding, Ground transport, Insurance, Other
3. **Vendor Management:** List/detail pages for suppliers with contact info and expense history
4. **Per-Booking P&L:** Revenue (from booking_services) minus Expenses (from finance_documents where doc_type='vendor_bill') = Gross Profit
5. **Receipt Uploads:** Camera/file upload to Supabase Storage (reuse existing `uploadFile` service)
6. **Approval Workflow:** Expenses > threshold require manager approval before recording

**Database Changes:**
- New `expense_categories` table: `id`, `name`, `icon`, `display_order`
- Add `category_id` FK to `finance_documents`
- Add `approved_by`, `approved_at` columns to `finance_documents`

**Estimated Effort:** Medium

**Dependencies:** Item [6] (shares finance_documents infrastructure)

**Visual Impact:** Replaces 14-line stub with expense management

---

### [8] Financial Dashboard & Reporting

**Status:** ⬜ Pending (not started)

**Category:** Financial & Accounting

**Severity:** High

**Context:**
- `app/admin/reports/page.jsx` is a **14-line stub**
- `recharts` library is already in `package.json`
- Revenue data exists in `booking_services` (unit_price × quantity)
- Cost data will exist in expenses (Item [7])
- No analytics or charts exist anywhere in the admin

**Issue Description:**
Zero financial visibility. No revenue charts, no expense breakdowns, no profit margins, no growth metrics. The dashboard shows booking counts but nothing financial.

**Impact:**
- Cannot answer "How much revenue did we generate this month?"
- Cannot identify most profitable routes/services
- Cannot forecast cash flow
- Cannot present business performance to stakeholders

**Proposed Solution:**
1. **Revenue Dashboard:** Monthly revenue chart (bar), revenue by service type (pie), revenue by route (treemap)
2. **Expense Dashboard:** Monthly expenses by category, vendor expense ranking, cost per relocation average
3. **P&L Report:** Revenue - Expenses - Tax = Net Profit per period
4. **Per-Booking Economics:** Revenue vs cost breakdown on each relocation detail page
5. **KPI Cards:** Total Revenue (MTD/YTD), Outstanding Invoices, Average Booking Value, Collection Rate, Gross Margin %
6. **Export:** CSV/Excel export for accountants

**Database Changes:** None — queries aggregate from existing `booking_services` and `finance_documents`

**Estimated Effort:** Medium

**Dependencies:** Items [6] and [7] (need invoice/expense data to report on)

**Visual Impact:** Replaces 14-line stub with rich analytics dashboard using recharts

---

### [9] Multi-Currency Support with Exchange Rates

**Status:** ⬜ Pending (not started)

**Category:** Financial & Accounting

**Severity:** Medium

**Context:**
- `bookings.currency` column exists
- `entities.currency` column exists (customer preferred currency)
- `finance_documents.currency` column exists
- No exchange rate table or conversion logic exists

**Issue Description:**
Pet relocations are international by nature. A UAE company invoices in AED but pays airline cargo in USD and vet fees in GBP. Without multi-currency support, financial reporting is inaccurate.

**Impact:**
- Cannot quote in customer's currency
- Cannot accurately calculate profit when costs are in different currencies
- Manual currency conversion = errors
- Cannot generate P&L in base currency (AED)

**Proposed Solution:**
1. **Exchange Rate Table:** Store daily rates with base currency (AED)
2. **Quote/Invoice Currency:** Allow selecting currency; store rate at document creation time (snapshot)
3. **Reporting Currency:** All reports convert to AED using stored rates
4. **API Integration:** Daily exchange rate fetch from a free API (e.g., exchangerate-api.com) via cron

**Database Changes:**
- New `exchange_rates` table: `id`, `base_currency`, `target_currency`, `rate`, `effective_date`
- Add `exchange_rate` column to `finance_documents` (rate at time of creation)

**Estimated Effort:** Medium

**Dependencies:** Items [6] and [7]

**Visual Impact:** Currency selector on quotes/invoices

---

---

### PILLAR 3: UI/UX & WORKFLOW EFFICIENCY (The Modern Aesthetic)

---

### [10] Global Command Palette (Cmd+K)

**Status:** ⬜ Pending (not started)

**Category:** UI/UX & Workflow Efficiency

**Severity:** High

**Context:**
- `components/dashboard/GlobalSearch.tsx` exists but is a basic search bar
- No keyboard shortcut system exists
- No command palette

**Issue Description:**
Power users (operations managers, coordinators) need to navigate between 20+ admin pages, find bookings by number, jump to customers — all without reaching for the mouse. A command palette (Cmd+K) is the #1 productivity feature in modern SaaS tools (Linear, Vercel, Notion).

**Impact:**
- Navigation requires clicking through sidebar → page → search → filter (4+ clicks)
- Cannot quickly find bookings by number, customer by name, or pet by microchip
- No keyboard-first workflow for power users

**Proposed Solution:**
1. **Cmd+K Palette:** Full-screen overlay with search input, categorized results (Bookings, Customers, Pets, Actions)
2. **Fuzzy Search:** Search across bookings (number, customer name), pets (name, microchip), entities (name, email)
3. **Quick Actions:** "Create Booking", "Create Quote", "Add Customer" directly from palette
4. **Recent Items:** Show last 5 accessed bookings/customers
5. **Keyboard Navigation:** Arrow keys + Enter to select, Esc to close
6. **Implementation:** Use `cmdk` library (0.2KB, built for React, used by Vercel/Linear) with shadcn/ui styling

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** Glassmorphic overlay (matches existing design language)

---

### [11] Booking Quick-Create Wizard (Reduce Clicks-to-Booking)

**Status:** ⬜ Pending (not started)

**Category:** UI/UX & Workflow Efficiency

**Severity:** High

**Context:**
- Current booking creation requires the full 5-step customer-facing form
- No admin-optimized booking creation flow
- Admin needs to create bookings from phone calls, emails, WhatsApp inquiries

**Issue Description:**
When a customer calls asking "How much to fly my dog from Dubai to London?", the coordinator needs to create a booking in under 60 seconds. The current 5-step form is designed for customers self-serving — it's too slow for trained operators.

**Impact:**
- Slow booking entry during phone calls (customer waits)
- Risk of losing information mid-call
- No "quick capture" for leads that might convert later

**Proposed Solution:**
1. **Slide-out Panel:** Right-side slide-out (not full page) triggered from any admin page
2. **Single-Screen Form:** Customer (autocomplete from entities), Origin → Destination, Pet (name + breed autocomplete from existing pets or quick-add), Travel date, Transport mode
3. **Auto-Fill:** If existing customer selected, auto-fill contact info and existing pets
4. **Smart Defaults:** Default transport mode = manifest_cargo, default currency = AED
5. **Save as Lead:** Quick save without requiring all fields (status = 'enquiry')
6. **Follow-up:** After save, offer "Create Quote" or "Add to Kanban"

**Database Changes:** None — uses existing `bookings`, `entities`, `pets`, `booking_pets` tables

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** New slide-out panel component

---

### [12] Notification Center & Real-Time Alerts

**Status:** ⬜ Pending (not started)

**Category:** UI/UX & Workflow Efficiency

**Severity:** High

**Context:**
- `notifications` table exists in `supabase/sql/10_communications.sql` with `user_id`, `title`, `message`, `is_read`
- No notification UI exists anywhere
- No Supabase Realtime subscriptions in the codebase
- No toast/alert system beyond `sonner` (used minimally)

**Issue Description:**
Operations staff need to know immediately when: a new enquiry arrives, a document is uploaded, a payment is received, a task is overdue, a booking status changes. Currently, they must refresh the page and manually check.

**Impact:**
- Missed enquiries = lost business
- Delayed responses to document uploads
- No awareness of team activity
- Cannot coordinate across time zones

**Proposed Solution:**
1. **Bell Icon in Header:** Badge count of unread notifications
2. **Dropdown Panel:** Last 20 notifications with mark-as-read
3. **Real-Time:** Supabase Realtime subscription on `notifications` table filtered by `user_id`
4. **Toast Alerts:** Use `sonner` for transient alerts on new notifications
5. **Notification Triggers:** Server-side triggers that create notifications on: new booking, status change, document upload, payment received, task overdue
6. **Sound Alert:** Optional audio ping for new notifications (configurable in settings)

**Database Changes:**
- Add `notification_type` column to `notifications` (enum: new_booking, status_change, document_upload, payment_received, task_overdue, message_received)
- Add `link_url` column for deep-linking to relevant page

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** Bell icon in header + dropdown panel

---

### [13] Decompose Oversized Components

**Status:** ⬜ Pending (not started)

**Category:** Architecture & Code Quality

**Severity:** High

**Context:**
- `components/admin/EditUserModal.tsx`: **40,511 bytes** — should be a page, not a modal
- `components/admin/BookingTable.jsx`: **21,453 chars** — monolithic table
- `components/admin/ServicesTable.tsx`: **15,037 chars** — handles rendering + state + actions
- `app/admin/services/[serviceId]/page.tsx`: **927 lines** — tabbed form with 4 tabs in one file
- `components/admin/CalendarView.jsx`: **14,775 chars**

**Issue Description:**
Five components exceed reasonable size limits. Large files are harder to maintain, slower to compile, impossible to code-split, and lead to excessive re-renders when any state changes.

**Impact:**
- Developer velocity: 2-3x slower to make changes in 900+ line files
- Bundle size: Cannot lazy-load portions of oversized components
- Re-render performance: State change in one tab re-renders all 4 tabs
- Onboarding: New developers need 30+ minutes to understand each file

**Proposed Solution:**
1. **EditUserModal → UserEditPage:** Convert from modal to dedicated page (`/admin/users/[id]/edit`). Split into: UserProfileForm, UserRoleSection, UserStatusSection, UserDangerZone.
2. **ServiceEditPage:** Split into: ServiceDetailsTab, ServiceLogicTab, ServiceFinancialsTab, ServiceMarketingTab (each <200 lines)
3. **BookingTable:** Extract: BookingTableRow, BookingStatusBadge, BookingTableFilters, BookingTablePagination
4. **ServicesTable:** Extract: ServiceRow, ServiceBulkActions, ServiceFilters
5. **CalendarView:** Extract: CalendarToolbar, CalendarEventCard, CalendarSidebar

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None — purely architectural refactor

---

### [14] Consistent Data Fetching Architecture

**Status:** ⬜ Pending (not started)

**Category:** Architecture & Code Quality

**Severity:** Medium

**Context:**
Current codebase uses 4 different patterns inconsistently:
- Server Components with direct Supabase queries: `app/admin/dashboard/page.jsx`, `app/admin/relocations/page.js`
- Client Components with `useEffect` + server actions: `app/admin/tasks/page.js`, `app/admin/pets/page.js`
- Client Components with `fetch('/api/...')`: `app/admin/services/page.jsx`
- Client Components with direct Supabase client: `app/admin/services/[serviceId]/page.tsx`

**Issue Description:**
Four different data fetching patterns across 12 admin pages. This creates confusion about where data flows, how errors are handled, and how caching works. Each pattern has different error handling (or none), different loading states (or none), and different revalidation strategies (or none).

**Impact:**
- Inconsistent UX (some pages have loading states, others don't)
- Security risk: Client-side Supabase queries bypass server-side validation
- No centralized error handling
- Impossible to implement consistent caching strategy

**Proposed Solution:**
Standardize on a **two-tier pattern**:

**Tier 1 (Server):** Server Components for initial page data. Use server actions (in `lib/actions/`) that call `supabaseAdmin`. Return typed data to page.

**Tier 2 (Client):** For interactive features (filters, search, real-time), use `useEffect` + server actions. Never use direct client-side Supabase queries.

**Kill Pattern:** Remove all `fetch('/api/...')` calls from admin pages — use server actions instead. Remove direct `supabase` client imports in admin pages.

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None — internal architecture improvement

---

---

### PILLAR 4: 100% MOBILE-FIRST EXECUTION (The Field Agent View)

---

### [15] Responsive Admin Layout with Bottom Navigation

**Status:** ⬜ Pending (not started)

**Category:** Mobile-First Execution

**Severity:** Critical

**Context:**
- Current admin uses a sidebar navigation (desktop-only)
- No responsive breakpoints on admin layout
- Tables overflow horizontally on mobile
- Touch targets not tested for 44px minimum
- No viewport-aware component rendering

**Issue Description:**
Airport agents checking AWBs on their phone, drivers confirming pickups on location, coordinators checking bookings on their iPad — none of this works with the current desktop-only layout. The sidebar is unusable on mobile, tables overflow, and there's no bottom navigation.

**Impact:**
- Field agents cannot use the system on mobile (must call office)
- Drivers cannot update status or upload photos from their phone
- Coordinators at airports cannot check bookings during cargo handling
- Entire field workforce is excluded from the digital workflow

**Proposed Solution:**
1. **Bottom Tab Bar (Mobile):** Fixed bottom navigation with 5 tabs: Home, Bookings, Tasks, Messages, Profile
2. **Sidebar → Drawer (Tablet):** Hamburger menu that slides in on tablet/mobile
3. **Responsive Breakpoints:** `sm` (phone), `md` (tablet), `lg` (desktop)
4. **Touch Targets:** Minimum 44×44px for all interactive elements
5. **Viewport Detection:** `useMediaQuery` hook to toggle between card and table views
6. **Safe Areas:** Respect `env(safe-area-inset-bottom)` for notched devices

**Database Changes:** None

**Estimated Effort:** Large

**Dependencies:** None (foundational — blocks all other mobile features)

**Visual Impact:** Major — complete mobile layout redesign

---

### [16] Card-Based List Views for Mobile

**Status:** ⬜ Pending (not started)

**Category:** Mobile-First Execution

**Severity:** High

**Context:**
- `components/admin/BookingTable.jsx` renders a traditional HTML table
- `components/admin/CustomerTable.jsx` same pattern
- `components/admin/PetTable.jsx` same pattern
- All tables break or require horizontal scroll on screens <768px

**Issue Description:**
HTML tables with 6+ columns are unusable on mobile. The 3-column minimum for a booking (Customer, Route, Status) already needs 500px+ width. Card-based views are the industry standard for mobile data display (see: Stripe Dashboard mobile, Linear mobile, any modern CRM).

**Impact:**
- Horizontal scrolling is disorienting and hides critical columns
- Users miss status/action columns scrolled off-screen
- Cannot perform actions (edit, delete) without horizontal scroll to action column
- Zero accessibility on mobile viewports

**Proposed Solution:**
For each table component, create a dual-mode render:

**Desktop (≥1024px):** Current table view (preserved)

**Mobile (<1024px):** Stacked card view with pet avatar, route badge, customer name, status badge, action button. Swipe-left to reveal quick actions (call, email, status update).

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** Item [15] (responsive layout foundation)

**Visual Impact:** New card components for mobile viewports

---

### [17] Field Camera Upload for Documents (AWB, Permits, Photos)

**Status:** ⬜ Pending (not started)

**Category:** Mobile-First Execution

**Severity:** High

**Context:**
- `uploadFile()` exists in `lib/services/storage.js` using Supabase Storage
- `STORAGE_BUCKETS` defined: photos, avatars, media, documents, public_assets
- No camera-specific upload UI exists
- Booking has document path columns: `documents_path`, `passport_path`, `vaccination_path`, `rabies_path`

**Issue Description:**
Airport agents need to photograph Air Waybills (AWBs), customs clearance documents, and pet collection confirmations directly from their phone camera. Currently, there's no mobile-optimized camera upload — only desktop file pickers.

**Impact:**
- Document collection requires returning to office to scan
- No real-time proof of pickup/delivery
- Compliance documentation delayed
- Cannot attach AWB photos to bookings from the tarmac

**Proposed Solution:**
1. **Camera Capture Component:** `<CameraUpload>` with `capture="environment"` attribute for rear camera
2. **Image Preview:** Show captured image with crop/rotate options before upload
3. **Auto-Compression:** Use `sharp` (already in deps) on server-side to compress images before storage
4. **Document Type Tag:** Select document type (AWB, Health Cert, Passport, Customs, Photo Proof) before upload
5. **Offline Queue:** If network is unavailable, queue uploads and sync when online (Service Worker)
6. **Attach to Booking:** Associate uploaded document with specific booking via `booking_id`

**Database Changes:**
- New `booking_documents` table: `id`, `booking_id`, `document_type` (enum), `file_path`, `uploaded_by`, `uploaded_at`, `notes`
- Normalizes the current 5 separate path columns into one table

**Estimated Effort:** Medium

**Dependencies:** Item [15] (mobile layout)

**Visual Impact:** New camera upload component

---

---

### PILLAR 5: SECURITY, RBAC & ARCHITECTURE (The DevSecOps View)

---

### [18] UI-Level Role-Based Access Control (RBAC)

**Status:** ⬜ Pending (not started)

**Category:** Security & RBAC

**Severity:** Critical

**Context:**
- 8 roles defined: super_admin, admin, ops_manager, relocation_coordinator, finance, driver, staff, customer
- `middleware.ts` only checks `admin` or `super_admin` for `/admin/*` routes — all other roles get 403
- `lib/constants/roles.ts` has `ASSIGNABLE` matrix for role creation, but not for page/feature access
- RLS at DB level is solid (`is_staff()` function), but UI shows everything to all staff roles

**Issue Description:**
An `ops_manager` and a `finance` user see the exact same dashboard, sidebar, and pages. A `driver` (if granted admin access) would see revenue figures, customer emails, profit margins. There is no UI-level permission system — everyone who passes the middleware check sees everything.

**Impact:**
- Finance data exposed to operations staff
- Customer PII accessible to drivers
- Delete/edit actions available to roles that shouldn't have them
- Violates principle of least privilege
- Potential compliance issues (GDPR, data protection)

**Proposed Solution:**
1. **Permission Matrix:** Define a `PERMISSIONS` constant mapping roles to features:
```
super_admin: ALL
admin: ALL except system settings
ops_manager: bookings, pets, customers, tasks, calendar, dispatch
relocation_coordinator: bookings (own), tasks (own), communications
finance: invoices, quotes, expenses, reports, customers (read-only)
driver: dispatch (own assignments), camera upload
staff: bookings (read-only), tasks (own)
customer: own bookings, own invoices, own documents
```

2. **`usePermission()` Hook:** `const canViewFinance = usePermission('finance.view')` — controls component rendering
3. **Sidebar Filtering:** Only show nav items the user has permission to access
4. **Action Guards:** Wrap edit/delete buttons in `<Permission action="booking.delete">` component
5. **Server-Side Validation:** Server actions verify role before executing (defense in depth)

**Database Changes:** None initially — permissions stored as a constant file. Later: `role_permissions` table for dynamic management.

**Estimated Effort:** Large

**Dependencies:** None (foundational security feature)

**Visual Impact:** Sidebar and page content changes per role

---

### [19] Server Action Input Validation & Error Handling

**Status:** ⬜ Pending (not started)

**Category:** Security & Architecture

**Severity:** High

**Context:**
- Some server actions validate inputs (e.g., `manageUser.ts` checks role permissions)
- Most actions have minimal validation: `lib/actions/pet-actions.js` (38 lines), `lib/actions/customer-actions.js` (34 lines) — no input validation
- No centralized error handling pattern
- Zod schemas exist for the booking form but not for server actions

**Issue Description:**
Server actions are the API boundary — they're where untrusted input enters the system. Several actions accept data without validation, rely on client-side validation only, or swallow errors silently.

**Impact:**
- Malformed data can corrupt the database
- Missing error messages frustrate users
- No consistent error format for the frontend to consume
- Potential injection vectors if user input reaches queries unvalidated

**Proposed Solution:**
1. **Zod Validation on Every Server Action:** Create schemas for all action inputs
2. **Standardized Response Format:**
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }
```
3. **Error Boundary Pattern:** Wrap all DB operations in try/catch, return structured errors
4. **Rate Limiting:** Apply rate limiting (existing `checkRateLimit()`) to write actions
5. **Audit Logging:** Log all write operations to `system_audit_logs`

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None — backend improvement

---

### [20] Implement Proper Pagination (Replace In-Memory Filtering)

**Status:** ⬜ Pending (not started)

**Category:** Performance & Scalability

**Severity:** High

**Context:**
- `app/admin/users/UsersClient.jsx`: Pagination UI exists but is **disabled** — all users loaded into memory, client-side filtered
- `app/admin/relocations/page.js`: Has server-side pagination (10 per page) — the only page doing it right
- `app/admin/services/page.jsx`: All services loaded, client-filtered
- `app/admin/pets/page.js`: All pets loaded
- `app/admin/tasks/page.js`: All tasks loaded

**Issue Description:**
Loading all records into memory works for 50 items. At 500 items, it's slow. At 5,000 items, the browser tab crashes. Only the relocations page implements server-side pagination. Every other list page loads everything.

**Impact:**
- At scale (1000+ users, 5000+ bookings): pages will crash or take 10+ seconds to load
- Client-side filtering is not searchable by backend indexes
- Wasted bandwidth transferring unused data
- Memory pressure on mobile devices

**Proposed Solution:**
1. **Standardize Pagination Pattern:** Create `usePaginatedQuery(action, { page, pageSize, filters })` hook
2. **Server Actions Accept Pagination:** All list actions accept `{ page, pageSize, search?, filters? }`
3. **Supabase `.range(from, to)`:** Use built-in pagination with `count: 'exact'` for total pages
4. **URL-Based Pagination:** Store page/filters in URL searchParams (bookmarkable, shareable)
5. **Debounced Search:** Server-side search with 300ms debounce (use existing `use-debounce` dep)

**Database Changes:** None — Supabase handles pagination natively

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** Pagination controls become functional

---

### [21] Loading States, Error Boundaries & Skeleton UI

**Status:** ⬜ Pending (not started)

**Category:** Reliability & Observability

**Severity:** High

**Context:**
- Most pages have no loading state during data fetch
- No `loading.tsx` files in any admin route
- No `error.tsx` files in any admin route
- Only `app/admin/pets/page.js` shows a skeleton while loading
- No error boundaries wrapping data-dependent components

**Issue Description:**
When a page is loading, users see either a blank white screen or a flash of unstyled content. When an API call fails, the page either silently shows empty data or crashes with a React error overlay. No graceful degradation anywhere.

**Impact:**
- Users perceive the app as broken or slow (no loading feedback)
- Errors crash entire pages instead of isolated sections
- No way to retry failed operations
- No guidance for users when something goes wrong

**Proposed Solution:**
1. **Next.js `loading.tsx`:** Add skeleton loading files to every admin route group
2. **Next.js `error.tsx`:** Add error boundaries with "retry" buttons
3. **Skeleton Components:** Create reusable `<TableSkeleton>`, `<CardSkeleton>`, `<StatsSkeleton>`
4. **Empty States:** Design "No data yet" states with helpful CTAs (e.g., "No bookings yet. Create your first booking →")
5. **Toast Notifications:** Use `sonner` consistently for action success/failure feedback

**Database Changes:** None

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** Shimmer skeletons during loading, error recovery UI

---

### [22] Environment Configuration & Settings Persistence

**Status:** ⬜ Pending (not started)

**Category:** DevEx & Maintainability

**Severity:** Medium

**Context:**
- `app/admin/settings/page.js` (338 lines): Settings form exists but **doesn't persist** — 1-second fake delay, data lost on refresh
- No `settings` or `configuration` table in database
- Settings tabs (Notifications, Security, API) are empty stubs

**Issue Description:**
The settings page is a visual shell. Nothing saves. Company name, email settings, timezone preferences, notification preferences — all lost on page refresh.

**Impact:**
- Cannot configure the application without code changes
- Each deployment requires manual ENV var updates for business settings
- No self-service configuration for admin users
- Notification preferences cannot be saved

**Proposed Solution:**
1. **System Settings Table:** Key-value store for application configuration
2. **Settings Server Actions:** `getSettings()`, `updateSettings(key, value)`
3. **Tabs Implementation:** General (company info), Notifications (email/SMS/WhatsApp triggers), Security (session timeout, 2FA), Integrations (API keys display)
4. **Permission Guard:** Only `super_admin` can modify system settings

**Database Changes:**
- New `system_settings` table: `id`, `key` (UNIQUE), `value` (JSONB), `category`, `updated_by`, `updated_at`

**Estimated Effort:** Small

**Dependencies:** None

**Visual Impact:** Settings page becomes functional

---

### [23] Implement Test Coverage Foundation

**Status:** ⬜ Pending (not started)

**Category:** DevEx & Maintainability

**Severity:** Medium

**Context:**
- Zero test files exist in the codebase
- No test configuration (no jest.config, no vitest.config, no playwright.config)
- No CI/CD pipeline
- `package.json` has no test scripts

**Issue Description:**
No automated tests means every change is a gamble. Server actions, business logic (IATA calculations, booking context detection, permission checks), and data mappers are all untested. A single typo in a server action can corrupt booking data with no safety net.

**Impact:**
- Every code change risks regression
- Cannot refactor safely
- No confidence in deployment
- Business-critical logic (IATA crate calculations, currency conversion) unverified

**Proposed Solution:**
1. **Vitest Setup:** Configure Vitest (fast, ESM-native, works with Next.js 16)
2. **Priority Test Targets:**
   - `calculateCrateSize()` — IATA compliance math must be correct
   - `detectBookingContext()` — Service type detection
   - `mapRawBookingToViewModel()` — Data transformation
   - Server actions: input validation, permission checks
   - Zod schemas: validation edge cases
3. **Test Script:** Add `"test": "vitest"` to package.json
4. **CI Integration:** GitHub Actions workflow: lint → type-check → test → build

**Database Changes:** None

**Estimated Effort:** Medium

**Dependencies:** None

**Visual Impact:** None

---

### [24] Customer Communication Hub (Email/WhatsApp/SMS)

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** Medium

**Context:**
- `communications` table exists: `booking_id`, `channel`, `direction`, `subject`, `message`
- Nodemailer configured with SMTP credentials
- WhatsApp field exists on contact records
- No communication UI in admin dashboard

**Issue Description:**
All customer communication happens outside the system (personal WhatsApp, Outlook). No record of what was said, when, or by whom. When a coordinator goes on leave, the replacement has zero context on customer conversations.

**Impact:**
- No audit trail of customer communications
- Context lost during handoffs
- Cannot reference previous conversations
- No email templates for common messages (booking confirmation, document request, delivery notification)

**Proposed Solution:**
1. **Communication Panel:** Tab on booking detail page showing all communications for that booking
2. **Send Email:** Compose and send emails directly from the booking page (uses Nodemailer)
3. **Email Templates:** Pre-built templates: Booking Confirmation, Document Request, Flight Details, Delivery Confirmation
4. **WhatsApp Link:** One-click open WhatsApp chat with customer (deep link to wa.me/number)
5. **Log External:** Quick-add form to log phone calls or WhatsApp messages that happened outside the system

**Database Changes:** None — `communications` table already exists

**Estimated Effort:** Medium

**Dependencies:** Item [3] (timeline component is shared)

**Visual Impact:** New communications tab on booking detail page

---

### [25] Airline & Route Database

**Status:** ⬜ Pending (not started)

**Category:** Operational Completeness

**Severity:** Medium

**Context:**
- `logistics_nodes` table exists with `node_type`, `iata_code`, `city`, `country_id`
- No airline data in the schema
- No route (origin-destination pair) pricing or rules
- No embargo/restriction database

**Issue Description:**
Pet relocation pricing and feasibility depends heavily on: which airline, which route, breed restrictions, seasonal embargoes, cargo capacity. Currently, all of this knowledge is in coordinators' heads — not in the system.

**Impact:**
- Cannot auto-suggest airlines for a route
- Cannot flag breed restrictions for specific carriers
- Cannot auto-calculate cargo estimates
- Knowledge lost when experienced staff leave

**Proposed Solution:**
1. **Airlines Table:** Carrier name, IATA code, pet policy (brachycephalic allowed?), max weight, crate requirements, embargo dates
2. **Route Pricing:** Origin airport → Destination airport → Base rate (varies by weight bracket)
3. **Breed Restrictions:** Which carriers ban which breeds
4. **Seasonal Embargoes:** Temperature-based restrictions (e.g., no pets in cargo when tarmac >30°C)
5. **Auto-Suggest:** On booking creation, suggest eligible airlines based on route + breed + weight + date

**Database Changes:**
- New `airlines` table: `id`, `name`, `iata_code`, `website`, `pet_policy` (JSONB), `brachycephalic_allowed`, `max_weight_kg`, `is_active`
- New `airline_routes` table: `id`, `airline_id`, `origin_node_id`, `destination_node_id`, `base_rate`, `weight_brackets` (JSONB), `transit_time_hours`
- New `airline_embargoes` table: `id`, `airline_id`, `reason`, `start_date`, `end_date`, `affected_routes` (JSONB)

**Estimated Effort:** Large

**Dependencies:** None

**Visual Impact:** New admin pages for airline/route management; auto-suggest on booking form

---

---

## 4. Prioritization

### Critical Priority (Build Immediately — Business Blockers)

| # | Item | Effort |
|---|------|--------|
| 1 | Kanban Pipeline Board | Large |
| 2 | Quotation Engine (Replace Mock Data) | Large |
| 6 | Invoice Generation & Management | Large |
| 15 | Responsive Layout + Bottom Nav | Large |
| 18 | UI-Level RBAC | Large |

### High Priority (Build Next — Operational Necessities)

| # | Item | Effort |
|---|------|--------|
| 3 | Live Relocation Tracking Timeline | Medium |
| 4 | Vet & Compliance Schedule Timeline | Large |
| 7 | Expense & Supplier Tracking | Medium |
| 8 | Financial Dashboard & Reporting | Medium |
| 10 | Command Palette (Cmd+K) | Medium |
| 11 | Booking Quick-Create Wizard | Medium |
| 12 | Notification Center | Medium |
| 13 | Decompose Oversized Components | Medium |
| 16 | Card-Based Mobile Views | Medium |
| 17 | Field Camera Upload | Medium |
| 19 | Server Action Validation | Medium |
| 20 | Server-Side Pagination | Medium |
| 21 | Loading States & Error Boundaries | Small |

### Medium Priority (Plan for Phase 2)

| # | Item | Effort |
|---|------|--------|
| 5 | Dispatch & Driver Assignment | Large |
| 9 | Multi-Currency Support | Medium |
| 14 | Consistent Data Fetching Architecture | Medium |
| 22 | Settings Persistence | Small |
| 23 | Test Coverage Foundation | Medium |
| 24 | Customer Communication Hub | Medium |
| 25 | Airline & Route Database | Large |

---

## 5. Refactor Roadmap

### Phase A: Foundation (Weeks 1-3)
**Theme: Make the existing system reliable and mobile-ready**

1. **[21] Loading States & Error Boundaries** — Quick win, improves perceived quality immediately
2. **[13] Decompose Oversized Components** — Unblocks all future development
3. **[15] Responsive Layout + Bottom Nav** — Foundational for all mobile work
4. **[20] Server-Side Pagination** — Required before data grows
5. **[19] Server Action Validation** — Security hardening

### Phase B: Revenue Engine (Weeks 4-6)
**Theme: Enable the business to make money**

6. **[2] Quotation Engine** — Replace mock data, enable quoting
7. **[6] Invoice Generation** — Enable billing
8. **[7] Expense Tracking** — Enable cost tracking
9. **[8] Financial Dashboard** — Enable visibility into revenue/costs

### Phase C: Operational Excellence (Weeks 7-10)
**Theme: Run relocations like a world-class operation**

10. **[1] Kanban Pipeline Board** — Transform operational visibility
11. **[3] Live Tracking Timeline** — Enable real-time coordination
12. **[4] Vet & Compliance Timeline** — Ensure no missed deadlines
13. **[12] Notification Center** — Enable real-time awareness
14. **[18] UI-Level RBAC** — Secure the platform per role

### Phase D: Speed & Scale (Weeks 11-14)
**Theme: Make power users blisteringly fast**

15. **[10] Command Palette** — Keyboard-first navigation
16. **[11] Booking Quick-Create** — 60-second booking entry
17. **[16] Card-Based Mobile Views** — Complete mobile experience
18. **[17] Field Camera Upload** — Enable field operations
19. **[24] Communication Hub** — Centralize customer comms

### Phase E: Enterprise Features (Weeks 15+)
**Theme: Scale to 100+ employees and 10,000+ bookings/year**

20. **[5] Dispatch & Driver Module** — Full logistics automation
21. **[9] Multi-Currency** — International accounting
22. **[25] Airline & Route Database** — Operational knowledge base
23. **[14] Consistent Architecture** — Long-term maintainability
24. **[22] Settings Persistence** — Self-service configuration
25. **[23] Test Coverage** — Safety net for ongoing development

---

## 6. Open Questions

1. **Payment Gateway:** Do you want Stripe/Tap integration for online payments, or is this invoice + bank transfer only?
2. **WhatsApp API:** Do you want WhatsApp Business API integration (send messages from dashboard) or just deep links to wa.me?
3. **Customer Portal:** Should customers have a login to track their relocation status, or is this admin-only?
4. **Multi-Branch:** Will Pawpaths operate from multiple offices (Dubai, Abu Dhabi, etc.) requiring branch-level reporting?
5. **Localization:** Should the admin support Arabic RTL layout?
6. **Existing Data:** How many bookings/customers/pets exist currently? (Affects pagination urgency)
7. **Deployment:** Is CI/CD via Vercel auto-deploy, or do you have a staging environment?

---

## 7. Next Steps

To proceed with implementation, please:

1. **Review this document thoroughly**
2. **Reply with the item numbers you want to execute**
   - Example: "Start with items 21, 13, and 15"
   - Example: "Execute Phase A first"
   - Example: "Do the Critical Priority items: 1, 2, 6, 15, 18"
3. I will then implement **ONLY** the approved items, one at a time, with status updates

**Remember:** I will not modify any code until you explicitly approve specific items.

---

## Appendix A: Files Analyzed

### Admin Routes (21 pages)
| Route | File | Lines |
|-------|------|-------|
| /admin/dashboard | app/admin/dashboard/page.jsx | 86 |
| /admin/users | app/admin/users/page.js + UsersClient.jsx | 361 |
| /admin/users/[id] | app/admin/users/[userId]/page.tsx + UserForm.tsx | 472 |
| /admin/quotes | app/admin/quotes/page.tsx | 367 |
| /admin/quotes/create | app/admin/quotes/create/page.tsx | 258 |
| /admin/services | app/admin/services/page.jsx | 280 |
| /admin/services/[id] | app/admin/services/[serviceId]/page.tsx | 927 |
| /admin/tasks | app/admin/tasks/page.js | 169 |
| /admin/task-templates | app/admin/task-templates/page.js | 37 |
| /admin/relocations | app/admin/relocations/page.js | 147 |
| /admin/relocations/[id] | app/admin/relocations/[id]/page.js | 282 |
| /admin/customers | app/admin/customers/page.js | 48 |
| /admin/pets | app/admin/pets/page.js | 83 |
| /admin/calendar | app/admin/calendar/page.js | 31 |
| /admin/themes | app/admin/themes/page.jsx | 551 |
| /admin/settings | app/admin/settings/page.js | 338 |
| /admin/settings/audit-logs | app/admin/settings/audit-logs/page.jsx | 256 |
| /admin/summary | app/admin/summary/page.jsx | 32 |
| /admin/reports | app/admin/reports/page.jsx | 14 |
| /admin/expenses | app/admin/expenses/page.jsx | 14 |
| /admin/invoices | app/admin/invoices/page.jsx | 14 |

### Admin Components (16 files)
| Component | File Size (chars) |
|-----------|------------------|
| EditUserModal.tsx | 40,511 |
| BookingTable.jsx | 21,453 |
| ServicesTable.tsx | 15,037 |
| CalendarView.jsx | 14,775 |
| PetTable.jsx | 11,529 |
| JobCostingTable.jsx | 10,680 |
| DeleteUserModal.tsx | 9,984 |
| CustomerTable.jsx | 9,333 |
| CustomerManagerModal.jsx | 8,530 |
| AdminHeader.jsx | 6,074 |
| BookingStatusControl.js | 4,434 |
| YearFilter.jsx | 2,333 |
| MonthFilter.jsx | 2,511 |
| TypeFilter.jsx | 2,136 |
| UnsavedChangesModal.jsx | 1,855 |
| SearchBar.jsx | 1,533 |

### Server Actions (10 files)
| Action | File Size (bytes) |
|--------|------------------|
| admin-booking-actions.js | 12,162 |
| booking-actions.js | 7,394 |
| task-automation-actions.js | 6,307 |
| manageUser.ts | ~8,000 |
| user-actions.js | 5,059 |
| service-actions.js | 4,575 |
| booking-interactions.js | 2,957 |
| calendar-actions.js | 2,495 |
| pet-actions.js | 694 |
| customer-actions.js | 612 |

### Database Schema (24+ SQL files)
| File | Tables |
|------|--------|
| 01_enums.sql | 11 enum types |
| 02_profiles.sql | profiles |
| 03_entities.sql | entities |
| 04_taxonomy.sql | species, breeds |
| 05_pets.sql | pets |
| 06_geography.sql | countries, logistics_nodes |
| 07_services.sql | service_categories, service_catalog |
| 08_bookings.sql | bookings, booking_pets, booking_services |
| 09_finance.sql | finance_documents, finance_items |
| 10_communications.sql | communications, notifications |
| 12_rls.sql | RLS policies (6 tables) |
| 21_audit_logs.sql | system_audit_logs |
| 22_booking_interactions.sql | booking_interactions |
| 23_24_tasks.sql | task_templates, tasks |

## Appendix B: Tech Stack Detected

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.8 |
| Runtime | React | 19.2.1 |
| Language | TypeScript (mixed with JS) | 5.9.3 |
| Styling | Tailwind CSS | 4.x |
| UI | shadcn/ui (implied) | Latest |
| Animation | Framer Motion | 12.35.2 |
| Icons | Lucide React | 0.556.0 |
| Database | Supabase (PostgreSQL) | 2.89.0 |
| Auth | Supabase Auth + SSR | 0.8.0 |
| Forms | React Hook Form + Zod | 7.70.0 / 4.3.5 |
| State | Zustand (persisted) | 5.0.9 |
| Charts | Recharts | 3.6.0 |
| Calendar | react-big-calendar | 1.19.4 |
| PDF | jspdf + jspdf-autotable | 3.0.4 / 5.0.2 |
| AI | OpenAI (GPT-4o) | 6.15.0 |
| Email | Nodemailer | 7.0.11 |
| Storage | Supabase Storage + AWS S3 | Latest |
| Images | Sharp | 0.34.5 |

---

**END OF AUDIT REPORT**

*No code has been modified. All changes require explicit user approval.*
*Report generated: 2026-03-19 by Claude (Nexus Architect)*
