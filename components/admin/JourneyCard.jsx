'use client';

import { useState, useMemo } from 'react';
import { Plane, Calendar, Pencil } from 'lucide-react';
import PetDrawer from '@/components/admin/PetDrawer';
import JourneyDetailsForm from '@/components/admin/JourneyDetailsForm';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Returns Export / Import / Pet Taxi / Transfer based on ISO country codes.
 * UAE → Other  : Export
 * Other → UAE  : Import
 * UAE → UAE    : Pet Taxi
 * Other → Other: Transfer
 */
function getRelocationLabel(originIso, destIso) {
    const from = (originIso || '').toUpperCase();
    const to   = (destIso   || '').toUpperCase();
    if (from === 'AE' && to === 'AE') return 'Pet Taxi';
    if (from === 'AE') return 'Export';
    if (to   === 'AE') return 'Import';
    return 'Transfer';
}

/** Resolves an ISO code to the country display name from the provided list. */
function getCountryName(isoCode, countriesList) {
    if (!isoCode) return '';
    const match = countriesList.find(
        c => c.iso_code?.toUpperCase() === isoCode.toUpperCase()
    );
    return match?.name || isoCode.toUpperCase();
}

/**
 * Formats a country name for display inside a compact pill:
 * - 1–2 words  → full name          ("Sri Lanka", "France")
 * - 3+ words   → dot-separated 3-letter abbreviation
 *
 * Stopwords (of, and, the …) are excluded when picking initials so that:
 *   "United Arab Emirates"  → U.A.E   (3 significant words)
 *   "United States of America" → U.S.A  ("of" skipped)
 *   "Bosnia and Herzegovina"   → B.A.H  (falls back to raw words when
 *                                         significant count < 3)
 */
const STOP_WORDS = new Set(['of', 'and', 'the', 'de', 'la', 'le', 'al', 'el', 'a', 'an', 'du', 'des']);

function formatCountryDisplay(name) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length <= 2) return name;

    // Prefer initials of significant (non-stopword) words
    const significant = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
    const pool = significant.length >= 3 ? significant : words;
    return pool.slice(0, 3).map(w => w[0].toUpperCase()).join('.');
}

// ─── sub-components ─────────────────────────────────────────────────────────

/** Pill badge used for country names. */
function CountryPill({ name }) {
    return (
        <div className="px-4 py-1.5 bg-white rounded-full border border-system-color-03/20 shadow-sm max-w-[130px] sm:max-w-none">
            <span className="font-baloo font-bold text-system-color-03 text-sm leading-tight text-center block truncate">
                {name || '—'}
            </span>
        </div>
    );
}

/** Small white pill badge (transport mode, relocation type). */
function TagPill({ children, className = '' }) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 bg-white rounded-full border border-system-color-03/20 shadow-sm font-baloo font-bold text-system-color-03 text-xs whitespace-nowrap ${className}`}
        >
            {children}
        </span>
    );
}

// ─── main component ──────────────────────────────────────────────────────────

/**
 * Journey & Timeline card for the relocation detail page.
 *
 * Props:
 *   bookingUUID   — string (UUID PK of the bookings row)
 *   travelDetails — { originCountry, originAirport, destinationCountry,
 *                     destinationAirport, transportMode, travelDate }
 *   countriesList — [{ id, name, iso_code }]
 */
export default function JourneyCard({ bookingUUID, travelDetails = {}, countriesList = [] }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const originCountryName = useMemo(
        () => formatCountryDisplay(getCountryName(travelDetails.originCountry, countriesList)),
        [travelDetails.originCountry, countriesList],
    );
    const destCountryName = useMemo(
        () => formatCountryDisplay(getCountryName(travelDetails.destinationCountry, countriesList)),
        [travelDetails.destinationCountry, countriesList],
    );
    const relocationLabel = useMemo(
        () => getRelocationLabel(travelDetails.originCountry, travelDetails.destinationCountry),
        [travelDetails.originCountry, travelDetails.destinationCountry],
    );

    const transportLabel = travelDetails.transportMode
        ? travelDetails.transportMode.replace(/_/g, ' ').toUpperCase()
        : 'MANIFEST CARGO';

    const formattedDate = travelDetails.travelDate
        ? new Date(travelDetails.travelDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year:    'numeric',
              month:   'long',
              day:     'numeric',
          })
        : 'Date Not Set';

    return (
        <>
            <div className="bg-system-color-03/5 rounded-2xl shadow-sm border-[0.5px] border-system-color-03/20 p-5 sm:p-6">

                {/* ── Card Header ─────────────────────────────────────── */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-system-color-03/10 text-system-color-03 rounded-xl border border-system-color-03/20">
                            <Plane size={22} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-system-color-03">
                                Journey &amp; Timeline
                            </h2>
                            <p className="text-[10px] text-brand-text-02/70 uppercase font-bold tracking-widest mt-0.5">
                                Logistics
                            </p>
                        </div>
                    </div>

                    {/* Master Edit */}
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 rounded-xl text-system-color-03/50 hover:text-system-color-03 hover:bg-system-color-03/10 transition-colors"
                        aria-label="Edit journey details"
                    >
                        <Pencil size={15} />
                    </button>
                </div>

                {/* ── Route Visualisation ─────────────────────────────── */}
                {/*
                 * Layout: 3-column flex (origin | connector | destination).
                 * items-start keeps columns top-aligned so the absolute line
                 * and pill in the connector column can be positioned precisely.
                 *
                 * Circle height: 96px.
                 * Label above circle: ~12px + 4px gap = 16px before circle top.
                 * Circle centre from column top: 16 + 48 = 64px.
                 * → line at top-[64px], plane circle mt-[40px] (w-12 = 48px → centre 40+24=64px).
                 *)
                */}
                <div className="flex items-start justify-between mb-5 relative">

                    {/* Origin column */}
                    <div className="flex flex-col items-center gap-2 w-[96px] sm:w-[108px] shrink-0">
                        <p className="text-[10px] text-brand-text-02/60 font-semibold uppercase tracking-widest">
                            Origin
                        </p>
                        <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] bg-white rounded-full flex items-center justify-center border-[3px] border-system-color-03/15 shadow-sm px-2">
                            <span className="font-baloo font-bold text-system-color-03 text-sm sm:text-base text-center leading-tight">
                                {travelDetails.originAirport || 'ORG'}
                            </span>
                        </div>
                        <CountryPill name={originCountryName} />
                    </div>

                    {/* Center connector column */}
                    <div className="flex-1 relative flex flex-col items-center min-h-[140px]">
                        {/*
                         * Horizontal line: positioned at the vertical centre of the
                         * origin/destination circles (see calculation comment above).
                         * Mobile 80px circle → centre = 12+4+40 = 56px.
                         * sm     96px circle → centre = 12+4+48 = 64px.
                         */}
                        <div className="absolute left-0 right-0 h-px bg-system-color-03/25 top-[56px] sm:top-[64px]" />

                        {/* Relocation-type pill — top of connector, aligns with labels */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                            <TagPill>{relocationLabel}</TagPill>
                        </div>

                        {/* Plane icon circle — centred on the line */}
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center
                                        border-2 border-system-color-03/20 shadow-sm relative z-10
                                        mt-[36px] sm:mt-[40px]"
                        >
                            <Plane className="text-system-color-03 rotate-90" size={18} />
                        </div>

                        {/* Transport mode pill — below plane circle */}
                        <TagPill className="mt-2 text-[10px]">
                            {transportLabel}
                        </TagPill>
                    </div>

                    {/* Destination column */}
                    <div className="flex flex-col items-center gap-2 w-[96px] sm:w-[108px] shrink-0">
                        <p className="text-[10px] text-brand-text-02/60 font-semibold uppercase tracking-widest">
                            Destination
                        </p>
                        <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] bg-white rounded-full flex items-center justify-center border-[3px] border-system-color-03/15 shadow-sm px-2">
                            <span className="font-baloo font-bold text-system-color-03 text-sm sm:text-base text-center leading-tight">
                                {travelDetails.destinationAirport || 'DST'}
                            </span>
                        </div>
                        <CountryPill name={destCountryName} />
                    </div>
                </div>

                {/* ── Scheduled Departure ─────────────────────────────── */}
                <div className="bg-white/70 rounded-xl p-4 border border-system-color-03/20 flex items-center gap-3">
                    <Calendar className="text-system-color-03 flex-shrink-0" size={18} />
                    <div className="min-w-0">
                        <p className="text-[10px] text-brand-text-02/70 font-bold uppercase tracking-widest">
                            Scheduled Departure
                        </p>
                        <p className="font-baloo font-bold text-gray-900 text-base sm:text-lg leading-snug truncate">
                            {formattedDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Edit Drawer ─────────────────────────────────────────── */}
            {/* key forces remount on open so the form always pre-fills fresh */}
            <PetDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Edit Journey Details"
            >
                <JourneyDetailsForm
                    key={drawerOpen ? 'open' : 'closed'}
                    bookingUUID={bookingUUID}
                    initialData={travelDetails}
                    countriesList={countriesList}
                    onSuccess={() => setDrawerOpen(false)}
                />
            </PetDrawer>
        </>
    );
}
