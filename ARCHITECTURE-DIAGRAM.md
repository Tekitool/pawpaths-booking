# Pawpath-Form — Architecture Layout Diagram

> **Generated:** 2026-03-11 | **Framework:** Next.js App Router | **Database:** Supabase (PostgreSQL)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PAWPATH-FORM SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐  │
│   │   BROWSER     │     │   VERCEL      │     │  SUPABASE    │     │  EXTERNAL    │  │
│   │   (Client)    │────▶│   (Edge +     │────▶│  (PostgreSQL │     │  SERVICES    │  │
│   │              │     │    Server)    │     │   + Auth +   │     │              │  │
│   │  Zustand     │◀────│  Middleware   │◀────│   Storage)   │     │  OpenAI      │  │
│   │  localStorage│     │  RSC + API   │     │  RLS + RPC   │     │  GPT-4o      │  │
│   │              │     │  Routes      │     │              │     │              │  │
│   └──────────────┘     └──────┬───────┘     └──────────────┘     │  AWS S3      │  │
│                               │                                   │  (Presigned) │  │
│                               │              ┌──────────────┐     │              │  │
│                               └─────────────▶│  RESEND      │     │  Resend      │  │
│                                              │  (Email)     │     │  (Email)     │  │
│                                              └──────────────┘     └──────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Directory Structure

```
pawpath-form/
│
├── app/                          # ── NEXT.JS APP ROUTER ──────────────────
│   ├── layout.js                 # Root Layout (Inter font, Providers)
│   ├── page.js                   # Root → redirect('/admin/dashboard')
│   ├── globals.css               # Tailwind + Brand Tokens
│   ├── error.tsx                 # Global Error Boundary
│   ├── not-found.tsx             # Global 404
│   │
│   ├── login/                    # ── AUTH ─────────────────────────────
│   │   ├── page.js               #    Login form (email/password)
│   │   └── auth/
│   │       ├── actions.js        #    Server Actions: login, signup, logout
│   │       └── callback/route.js #    OAuth callback handler
│   │
│   ├── enquiry/                  # ── PUBLIC BOOKING WIZARD ───────────
│   │   └── page.js               #    Server Component → BookingWizard
│   │
│   ├── booking/                  # ── BOOKING SERVER ACTIONS ──────────
│   │   └── actions.js            #    submitEnquiry() pipeline
│   │
│   ├── services/                 # ── PUBLIC SERVICES PAGE ────────────
│   │   └── page.js               #    Service offerings
│   │
│   ├── tools/                    # ── PUBLIC TOOL SUITE (15 tools) ────
│   │   ├── layout.tsx            #    Tools Layout (Header + Footer)
│   │   ├── page.tsx              #    Tools hub directory
│   │   ├── crate-size-calculator/#    IATA crate calculator
│   │   ├── pet-breed-scanner/    #    AI breed ID (GPT-4o)
│   │   ├── cost-calculator/      #    Cost estimator
│   │   ├── quote/                #    Smart quote engine
│   │   ├── eligibility/          #    Travel eligibility checker
│   │   ├── microchip/            #    Microchip info
│   │   ├── timeline/             #    Relocation timeline
│   │   ├── rules/                #    Airline/country regulations
│   │   ├── weather/              #    Travel weather check
│   │   ├── training/             #    Pet training guide
│   │   ├── docs/                 #    Documentation
│   │   ├── petphoto/             #    Pet photo gallery
│   │   ├── budget/               #    Budget planner
│   │   └── coming-soon/          #    Placeholder
│   │
│   ├── admin/                    # ── PROTECTED ADMIN PANEL ───────────
│   │   ├── layout.js             #    Admin Layout (user + profile fetch)
│   │   ├── error.tsx             #    Admin Error Boundary
│   │   ├── loading.tsx           #    Admin Loading Skeleton
│   │   ├── page.jsx              #    Admin home
│   │   ├── dashboard/            #    Analytics dashboard
│   │   ├── summary/              #    Summary reports
│   │   ├── relocations/          #    Booking list + [id] detail
│   │   ├── bookings/             #    → Redirects to /relocations
│   │   ├── customers/            #    Customer list
│   │   ├── pets/                 #    Pet registry
│   │   ├── services/             #    Service CRUD + [serviceId]
│   │   ├── quotes/               #    Quotes list + create
│   │   ├── invoices/             #    Invoicing
│   │   ├── expenses/             #    Expense tracking
│   │   ├── reports/              #    Reports
│   │   ├── calendar/             #    Event calendar
│   │   ├── tasks/                #    Task management
│   │   ├── task-templates/       #    Task templates
│   │   ├── themes/               #    Theme configuration
│   │   ├── users/                #    Staff management + [userId]
│   │   └── settings/             #    Settings + audit-logs
│   │
│   ├── dashboard/                # ── CUSTOMER DASHBOARD ──────────────
│   │   └── relocations/[id]/     #    Customer relocation detail view
│   │
│   ├── api/                      # ── API ROUTE HANDLERS ─────────────
│   │   ├── health/route.js       #    Health check endpoint
│   │   ├── booking/route.js      #    Booking submission (rate-limited)
│   │   ├── services/route.js     #    Service catalog (public)
│   │   ├── services/[id]/route.js#    Service CRUD (role-checked)
│   │   ├── tools/identify-breed/ #    AI breed identification
│   │   ├── ai-crate-audit/       #    AI crate analysis
│   │   └── upload/               #    Avatar + presigned URL upload
│   │
│   ├── enquiry-old/              #    ⚠️  Legacy (to be removed)
│   ├── booking-new/              #    ⚠️  Empty placeholder
│   └── test-storage/             #    ⚠️  Dev-only (to be removed)
│
├── components/                   # ── REACT COMPONENTS ────────────────
│   ├── ui/                       #    Atomic Primitives (~15)
│   │   ├── Button.jsx            #      Button variants
│   │   ├── Input.jsx             #      Text input
│   │   ├── Select.jsx            #      Dropdown select
│   │   ├── Card.jsx              #      Content card
│   │   ├── Badge.jsx             #      Status badge
│   │   ├── Avatar.jsx            #      User avatar
│   │   ├── GlassCard.jsx         #      Glass morphism card
│   │   └── ...                   #      + more primitives
│   │
│   ├── booking/                  #    Booking Wizard Steps (~10)
│   │   ├── Step1Travel.jsx       #      Origin/Destination/Date
│   │   ├── Step2Pets.jsx         #      Pet information
│   │   ├── Step3Services.jsx     #      Service selection
│   │   ├── Step4Documents.jsx    #      Document upload
│   │   ├── Step5Review.jsx       #      Review & contact info
│   │   ├── Step6Success.jsx      #      Confirmation
│   │   ├── BookingWizard.jsx     #      Step orchestrator
│   │   ├── PetDocumentFrame.jsx  #      Per-pet doc upload
│   │   ├── DropzoneBox.jsx       #      File dropzone
│   │   └── ValidationFailureModal.jsx
│   │
│   ├── admin/                    #    Admin Components (~8)
│   │   ├── AdminSidebar.jsx      #      Navigation sidebar
│   │   ├── AdminHeader.jsx       #      Top header bar
│   │   ├── StatCard.jsx          #      Dashboard stat cards
│   │   └── ...                   #      + more admin UI
│   │
│   ├── layouts/                  #    Page Layouts
│   ├── dashboard/                #    Customer Dashboard Components
│   ├── quotes/                   #    Quote Builder Components
│   ├── relocation/               #    Relocation Detail Components
│   ├── services/                 #    Service Display Components
│   ├── tools/                    #    Tool-specific Components
│   ├── summary/                  #    Summary Components
│   ├── master-data/              #    Data Management Components
│   │
│   ├── Providers.js              #    App-wide Providers (Sonner toast)
│   ├── BookingForm.jsx           #    Legacy booking form
│   ├── BookingHeader.jsx         #    Public page header
│   └── ElegantFooter.jsx         #    Public page footer
│
├── lib/                          # ── BUSINESS LOGIC & SERVICES ───────
│   ├── store/
│   │   └── booking-store.js      #    Zustand store (persisted)
│   │
│   ├── supabase/
│   │   ├── server.js             #    Server client (cookie-based)
│   │   ├── client.js             #    Browser client (anon key)
│   │   └── admin.js              #    Admin client (service role)
│   │
│   ├── actions/                  #    Server Actions (19 files)
│   │   ├── admin-booking-actions.js
│   │   ├── booking-actions.js
│   │   ├── booking-interactions.js
│   │   ├── customer-actions.js
│   │   ├── customer-mutations.js
│   │   ├── dashboard-actions.js
│   │   ├── calendar-actions.js
│   │   ├── pet-actions.js
│   │   ├── service-actions.js
│   │   ├── user-actions.js
│   │   ├── manageUser.ts
│   │   ├── manage-master-data.js
│   │   ├── manage-relocation.js
│   │   ├── admin-task-actions.js
│   │   ├── task-template-actions.js
│   │   ├── task-automation-actions.js
│   │   └── storage.js
│   │
│   ├── constants/                #    Enums & lookup data
│   ├── mappers/                  #    Data transformation
│   ├── services/                 #    Business service layer
│   ├── utils/                    #    Helper functions
│   │   └── emailTemplate.js      #      Email HTML builder
│   │
│   ├── schemas.ts                #    Zod validation schemas
│   ├── rate-limit.ts             #    Rate limiter utility
│   ├── audit-logger.js           #    Audit trail logger
│   ├── storage-service.js        #    File storage operations
│   └── theme-config.js           #    Theme token config
│
├── hooks/                        # ── CUSTOM REACT HOOKS ──────────────
│   ├── useAvailableServices.ts   #    Supabase RPC service fetch
│   ├── useCrateCalculator.ts     #    IATA crate dimensions
│   ├── useSmartSearch.ts         #    Multi-mode admin search
│   └── use-toast.js              #    Sonner toast wrapper
│
├── types/                        # ── TYPESCRIPT DEFINITIONS ──────────
├── utils/                        # ── GENERAL UTILITIES ───────────────
├── scripts/                      # ── DEV & ADMIN SCRIPTS ────────────
├── supabase/                     # ── SUPABASE CONFIG ─────────────────
├── tests/                        # ── TEST FILES ──────────────────────
├── public/                       # ── STATIC ASSETS ───────────────────
│
├── middleware.ts                 #    Auth guard (session check)
├── next.config.mjs               #    Next.js configuration
├── tailwind.config.ts            #    Tailwind CSS config
├── package.json                  #    Dependencies
└── CLAUDE.md                     #    Project instructions
```

---

## 3. Booking Wizard — Component & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        ENQUIRY PAGE DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   app/enquiry/page.js  (Server Component)                                          │
│   │                                                                                 │
│   │  FETCHES FROM SUPABASE:                                                        │
│   │  ├── speciesList    → species table                                            │
│   │  ├── breedsList     → breeds table                                             │
│   │  ├── countriesList  → countries table                                          │
│   │  └── genderOptions  → gender enum                                              │
│   │                                                                                 │
│   └──▶ <BookingWizard>  (Client Component — 'use client')                          │
│        │                                                                            │
│        │  PROPS: speciesList, breedsList, countriesList, genderOptions              │
│        │  STATE: useBookingStore() → currentStep (1-6)                              │
│        │                                                                            │
│        ├── Step 1 ─ <Step1Travel>                                                   │
│        │   │  Props: countriesList                                                  │
│        │   │  Store: updateTravelDetails()                                          │
│        │   └─ Fields: origin, destination, date, transportMode, travelingWithPet   │
│        │                                                                            │
│        ├── Step 2 ─ <Step2Pets>                                                     │
│        │   │  Props: speciesList, breedsList, genderOptions                         │
│        │   │  Store: addPet(), removePet(), updatePet()                             │
│        │   └─ Fields: species, breed, name, gender, age, weight, DOB,              │
│        │              microchip, passport, medical_alerts, specialRequirements     │
│        │                                                                            │
│        ├── Step 3 ─ <Step3Services>                                                 │
│        │   │  Props: none (uses useAvailableServices hook)                          │
│        │   │  Store: updateServices()                                               │
│        │   └─ Fetches: Supabase RPC based on origin/destination/species            │
│        │                                                                            │
│        ├── Step 4 ─ <Step4Documents>                                                │
│        │   │  Props: none                                                           │
│        │   │  Store: setFormData() for petDocuments                                 │
│        │   └─ Sub: <PetDocumentFrame> per pet → <DropzoneBox> per doc type         │
│        │                                                                            │
│        ├── Step 5 ─ <Step5Review>  (forwardRef)                                     │
│        │   │  Props: speciesList, breedsList                                        │
│        │   │  Store: updateContactInfo()                                            │
│        │   │  Exposes: handleSubmit() via useImperativeHandle                       │
│        │   └─ Fields: fullName, email, phone, whatsapp, address                    │
│        │                                                                            │
│        └── Step 6 ─ <Step6Success>                                                  │
│            │  Props: speciesList, breedsList                                        │
│            └─ Displays: booking reference, summary                                 │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. State Management — Zustand Store

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     useBookingStore  (Zustand + persist)                             │
│                     localStorage key: 'pawpaths-booking-storage'                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─ Navigation ────────────────────────────────────────────────────────────────┐   │
│   │  currentStep: number (1-6)                                                  │   │
│   │  setStep(n) | nextStep() | prevStep()                                       │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ formData ──────────────────────────────────────────────────────────────────┐   │
│   │                                                                              │   │
│   │  travelDetails: {                                                            │   │
│   │    originCountry, originAirport,                                             │   │
│   │    destinationCountry, destinationAirport,                                   │   │
│   │    travelDate, transportMode, travelingWithPet                               │   │
│   │  }                                                                           │   │
│   │                                                                              │   │
│   │  pets: [{                                                                    │   │
│   │    id, name, species_id, breed_id, gender, age, ageUnit, weight,             │   │
│   │    date_of_birth, microchip_id, passport_number, medical_alerts,             │   │
│   │    specialRequirements, speciesName, breedName                               │   │
│   │  }, ...]                                                                     │   │
│   │                                                                              │   │
│   │  services: [serviceId, ...]        (selected IDs)                            │   │
│   │  servicesData: [{...}, ...]        (full service objects)                     │   │
│   │                                                                              │   │
│   │  petDocuments: { [petIndex]: { photo, medicalDocs } }                        │   │
│   │  documents: { passport, vaccination, rabies }    (legacy)                    │   │
│   │                                                                              │   │
│   │  contactInfo: {                                                              │   │
│   │    fullName, email, phone, whatsapp, whatsappSameAsPhone,                    │   │
│   │    address: { street, city, state, country, postalCode }                     │   │
│   │  }                                                                           │   │
│   │                                                                              │   │
│   └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Actions ───────────────────────────────────────────────────────────────────┐   │
│   │  updateTravelDetails(details)                                                │   │
│   │  addPet(pet) | removePet(index) | updatePet(index, details)                  │   │
│   │  updateServices(ids, fullObjects)                                            │   │
│   │  updateContactInfo(info)                                                     │   │
│   │  updateDocuments(docs)                                                       │   │
│   │  setFormData(updater)              (generic)                                 │   │
│   │  resetForm()                                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Booking Result ────────────────────────────────────────────────────────────┐   │
│   │  bookingReference: string | null                                             │   │
│   │  setBookingReference(ref)                                                    │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTH FLOW                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   BROWSER REQUEST                                                                   │
│       │                                                                             │
│       ▼                                                                             │
│   ┌───────────────────────────────────────────────────────────┐                     │
│   │                  middleware.ts                             │                     │
│   │                                                           │                     │
│   │   PUBLIC ROUTES (bypass auth):                            │                     │
│   │   /enquiry, /services, /tools/*, /api/booking,            │                     │
│   │   /api/tools/*, /api/health, /api/upload/*,               │                     │
│   │   /auth/callback, /_next/*, /favicon.ico                  │                     │
│   │                                                           │                     │
│   │   PROTECTED ROUTES:                                       │                     │
│   │   /admin/* , /dashboard/*                                 │                     │
│   │                                                           │                     │
│   │   CHECK: supabase.auth.getUser()                          │                     │
│   │   ├── No session → redirect('/login?redirectTo=...')      │                     │
│   │   └── Has session → allow through                         │                     │
│   │                                                           │                     │
│   │   ⚠️  NO RBAC — any authenticated user gets admin access  │                     │
│   │                                                           │                     │
│   └───────────────────────────────────────────────────────────┘                     │
│       │                                                                             │
│       ▼                                                                             │
│   ┌───────────────────────────────────────────────────────────┐                     │
│   │              SUPABASE AUTH (3 Clients)                     │                     │
│   │                                                           │                     │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │                     │
│   │   │   Browser    │  │   Server    │  │   Admin     │     │                     │
│   │   │   Client     │  │   Client    │  │   Client    │     │                     │
│   │   │             │  │             │  │             │     │                     │
│   │   │  anon key   │  │  anon key   │  │ service     │     │                     │
│   │   │  client-    │  │  + cookies  │  │ role key    │     │                     │
│   │   │  side only  │  │  SSR auth   │  │ full access │     │                     │
│   │   │             │  │             │  │             │     │                     │
│   │   │ client.js   │  │ server.js   │  │ admin.js    │     │                     │
│   │   └─────────────┘  └─────────────┘  └─────────────┘     │                     │
│   │                                                           │                     │
│   └───────────────────────────────────────────────────────────┘                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Submission Pipeline — Dual Path

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     BOOKING SUBMISSION — TWO PATHS                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   Step5Review.handleSubmit()                                                        │
│       │                                                                             │
│       ├── PATH A: Server Action ──────────────────────────────────────────────┐     │
│       │   app/booking/actions.js → submitEnquiry()                            │     │
│       │   │                                                                   │     │
│       │   │  1. Validate with EnquirySchema (Zod)                            │     │
│       │   │  2. Upsert entity (client) → entities table                      │     │
│       │   │  3. Insert pets → booking_pets table                             │     │
│       │   │  4. Create booking → bookings table                              │     │
│       │   │  5. Link services → booking_services table                       │     │
│       │   │  6. Upload documents → Supabase Storage                          │     │
│       │   │  7. Send confirmation email → Resend                             │     │
│       │   │  8. Return booking reference                                     │     │
│       │   │                                                                   │     │
│       │   └── Uses: supabaseAdmin (service role — bypasses RLS)              │     │
│       │                                                                       │     │
│       ├── PATH B: API Route ──────────────────────────────────────────────────┐     │
│       │   POST /api/booking/route.js                                          │     │
│       │   │                                                                   │     │
│       │   │  Same pipeline as Path A                                         │     │
│       │   │  + Rate limiting (rate-limit.ts)                                 │     │
│       │   │  + multipart/form-data support (file uploads)                    │     │
│       │   │                                                                   │     │
│       │   └── Uses: supabaseAdmin (service role — bypasses RLS)              │     │
│       │                                                                       │     │
│       └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                     │
│   DATABASE TABLES TOUCHED:                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│   │  entities    │  │ booking_pets │  │  bookings    │  │ booking_services │       │
│   │  (clients)   │  │  (per pet)   │  │  (master)    │  │  (junction)      │       │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Route Classification Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          ROUTE ACCESS MATRIX                                         │
├──────────────────────────────┬───────────┬───────────┬───────────────────────────────┤
│  Route                       │  Access   │  Auth     │  Notes                        │
├──────────────────────────────┼───────────┼───────────┼───────────────────────────────┤
│  /                           │  PUBLIC   │  None     │  Redirects to /admin/dashboard│
│  /login                      │  PUBLIC   │  None     │  Auth → redirect to dashboard │
│  /enquiry                    │  PUBLIC   │  None     │  Main booking wizard          │
│  /services                   │  PUBLIC   │  None     │  Service offerings            │
│  /tools/*                    │  PUBLIC   │  None     │  15 public tools              │
├──────────────────────────────┼───────────┼───────────┼───────────────────────────────┤
│  /admin/*                    │ PROTECTED │ Session   │  ⚠️ No role check             │
│  /admin/dashboard            │ PROTECTED │ Session   │  Main admin view              │
│  /admin/relocations          │ PROTECTED │ Session   │  Booking management           │
│  /admin/customers            │ PROTECTED │ Session   │  Customer CRM                 │
│  /admin/pets                 │ PROTECTED │ Session   │  Pet registry                 │
│  /admin/services             │ PROTECTED │ Session   │  Service CRUD                 │
│  /admin/quotes               │ PROTECTED │ Session   │  Quote management             │
│  /admin/invoices             │ PROTECTED │ Session   │  Financial                    │
│  /admin/users                │ PROTECTED │ Session   │  Staff management             │
│  /admin/settings             │ PROTECTED │ Session   │  System settings              │
│  /dashboard/relocations/[id] │ PROTECTED │ Session   │  Customer detail view         │
├──────────────────────────────┼───────────┼───────────┼───────────────────────────────┤
│  /api/health                 │  PUBLIC   │  None     │  Healthcheck                  │
│  /api/booking                │  PUBLIC   │  None     │  Rate-limited                 │
│  /api/services               │  PUBLIC   │  None     │  Catalog read                 │
│  /api/services/[id]          │ PROTECTED │ Role      │  Service CRUD                 │
│  /api/tools/identify-breed   │  PUBLIC   │  None     │  ⚠️ No rate limit             │
│  /api/ai-crate-audit         │  PUBLIC   │  None     │  ⚠️ No rate limit             │
│  /api/upload/avatar          │  PUBLIC   │  None     │  ⚠️ No auth                   │
│  /api/upload/presigned       │  PUBLIC   │  None     │  Presigned URL gen            │
├──────────────────────────────┼───────────┼───────────┼───────────────────────────────┤
│  /enquiry-old                │  PUBLIC   │  None     │  ⚠️ Legacy — remove           │
│  /test-storage               │  PUBLIC   │  None     │  ⚠️ Dev-only — remove         │
│  /booking-new                │    —      │  —        │  ⚠️ Empty directory            │
└──────────────────────────────┴───────────┴───────────┴───────────────────────────────┘
```

---

## 8. Server Actions Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       SERVER ACTIONS (19 files)                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─ Auth ──────────────────────────────────────────────────────────────────────┐   │
│   │  app/login/auth/actions.js      → login(), signup(), logout()              │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Booking Pipeline ──────────────────────────────────────────────────────────┐   │
│   │  app/booking/actions.js         → submitEnquiry()                           │   │
│   │  lib/actions/admin-booking-actions.js → admin CRUD, status updates          │   │
│   │  lib/actions/booking-actions.js      → queries, mappers                     │   │
│   │  lib/actions/booking-interactions.js → interaction tracking                 │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Entity Management ────────────────────────────────────────────────────────┐   │
│   │  lib/actions/customer-actions.js     → customer queries                    │   │
│   │  lib/actions/customer-mutations.js   → customer create/update              │   │
│   │  lib/actions/pet-actions.js          → pet CRUD                            │   │
│   │  lib/actions/user-actions.js         → user CRUD                           │   │
│   │  lib/actions/manageUser.ts           → user management (typed)             │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Operations ────────────────────────────────────────────────────────────────┐   │
│   │  lib/actions/service-actions.js      → service catalog                     │   │
│   │  lib/actions/manage-relocation.js    → relocation workflow                 │   │
│   │  lib/actions/manage-master-data.js   → reference data                      │   │
│   │  lib/actions/dashboard-actions.js    → dashboard stats                     │   │
│   │  lib/actions/calendar-actions.js     → scheduling                          │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Task System ───────────────────────────────────────────────────────────────┐   │
│   │  lib/actions/admin-task-actions.js        → task management                │   │
│   │  lib/actions/task-template-actions.js     → task templates                 │   │
│   │  lib/actions/task-automation-actions.js   → automation helpers             │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│   ┌─ Infrastructure ───────────────────────────────────────────────────────────┐   │
│   │  lib/actions/storage.js              → file upload operations              │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Domain & SEO Status

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    DOMAIN FRAGMENTATION (Current State)                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ⚠️  THREE DIFFERENT DOMAINS REFERENCED IN CODEBASE:                               │
│                                                                                     │
│   ┌─────────────────────────────────┬────────────────────────────────────────────┐  │
│   │  pawpaths-booking.vercel.app    │  Root layout metadataBase                  │  │
│   ├─────────────────────────────────┼────────────────────────────────────────────┤  │
│   │  booking.pawpathsae.com         │  Crate calculator canonical/OG URLs        │  │
│   ├─────────────────────────────────┼────────────────────────────────────────────┤  │
│   │  pawpaths.com                   │  Breed scanner canonical URL               │  │
│   └─────────────────────────────────┴────────────────────────────────────────────┘  │
│                                                                                     │
│   MISSING SEO INFRASTRUCTURE:                                                       │
│   ╳ robots.txt          ╳ sitemap.xml         ╳ manifest.json                      │
│   ╳ JSON-LD schema      ╳ Consistent canonical ╳ Admin noindex                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Security Posture Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ISSUES                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  🔴 CRITICAL                                                                        │
│  SEC-1: No RBAC in middleware — any auth user = full admin access                   │
│                                                                                     │
│  🟠 HIGH                                                                             │
│  SEC-2: AI endpoints (/api/tools/identify-breed, /api/ai-crate-audit)              │
│         → No rate limiting, no auth → GPT-4o cost abuse risk                        │
│  SEC-3: Avatar upload (/api/upload/avatar) → No authentication                     │
│                                                                                     │
│  🟡 MEDIUM                                                                           │
│  SEC-4: No idempotency on booking API → double-submit = duplicate bookings          │
│  SEC-5: Login form has no rate limiting → brute force possible                      │
│                                                                                     │
│  🟢 LOW                                                                              │
│  SEC-6: Signup doesn't auto-create profile → manual step required                   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
