'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PlaneTakeoff, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { COUNTRIES } from '@/lib/constants/countries';
import { updateJourneyDetails } from '@/lib/actions/admin-journey-actions';

/**
 * Normalises any date value (ISO timestamp, date string, or Date object)
 * to the "YYYY-MM-DD" format required by <input type="date">.
 * Returns '' if the value cannot be parsed.
 */
function toDateInputValue(val) {
    if (!val) return '';
    const str = String(val);
    // Already in YYYY-MM-DD — return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // ISO timestamp or anything parseable
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    // Use UTC parts to avoid timezone day-shift
    const yyyy = d.getUTCFullYear();
    const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd   = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/** Build initial form state from initialData (handles any date format). */
function buildFormState(d = {}) {
    return {
        originCountry:      d.originCountry      || '',
        originAirport:      d.originAirport       || '',
        destinationCountry: d.destinationCountry  || '',
        destinationAirport: d.destinationAirport  || '',
        transportMode:      d.transportMode       || '',
        travelDate:         toDateInputValue(d.travelDate),
    };
}

/**
 * Standalone form for editing journey / travel details.
 *
 * Props:
 *   bookingUUID   — string UUID of the booking row
 *   initialData   — { originCountry, originAirport, destinationCountry,
 *                     destinationAirport, transportMode, travelDate }
 *   countriesList — [{ id, name, iso_code }] from Supabase
 *   onSuccess     — fn() called after successful save (closes drawer)
 */
export default function JourneyDetailsForm({ bookingUUID, initialData = {}, countriesList = [], onSuccess }) {
    const [form, setForm] = useState(() => buildFormState(initialData));
    const [saving, setSaving] = useState(false);

    // Sync form state whenever initialData reference changes (drawer re-opened after page refresh).
    const prevInitialData = useRef(initialData);
    useEffect(() => {
        if (prevInitialData.current !== initialData) {
            prevInitialData.current = initialData;
            setForm(buildFormState(initialData));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Sort countries: UAE first, then alphabetically
    const countryOptions = useMemo(() => {
        const list = countriesList.length ? countriesList : COUNTRIES;
        const uae    = list.find(c => c.iso_code === 'AE');
        const others = list.filter(c => c.iso_code !== 'AE').sort((a, b) => a.name.localeCompare(b.name));
        return (uae ? [uae, ...others] : others).map(c => ({ value: c.iso_code, label: c.name }));
    }, [countriesList]);

    // Transport options depend on selected countries
    const transportOptions = useMemo(() => {
        const isLocal =
            form.originCountry.toUpperCase() === 'AE' &&
            form.destinationCountry.toUpperCase() === 'AE';
        if (isLocal) {
            return [{ value: 'ground_transport', label: 'Ground Transport (Road)' }];
        }
        return [
            { value: 'manifest_cargo',  label: 'Manifest Cargo (Unaccompanied)' },
            { value: 'in_cabin',        label: 'In Cabin (Accompanied)'          },
            { value: 'excess_baggage',  label: 'Excess Baggage (Accompanied)'    },
            { value: 'private_charter', label: 'Private Charter (VIP)'           },
        ];
    }, [form.originCountry, form.destinationCountry]);

    // Auto-correct transport mode when country selection makes the current mode invalid
    const isMountRef = useRef(true);
    useEffect(() => {
        if (isMountRef.current) {
            isMountRef.current = false;
            return; // skip on initial mount — don't clobber pre-filled value
        }
        const isValid = transportOptions.some(opt => opt.value === form.transportMode);
        if (!isValid && transportOptions.length > 0) {
            setForm(prev => ({ ...prev, transportMode: transportOptions[0].value }));
        }
    }, [transportOptions]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await updateJourneyDetails(bookingUUID, form);
            if (result.success) {
                toast.success('Journey details updated');
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to save');
            }
        } catch {
            toast.error('Unexpected error — please try again');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-6">

            {/* ── Origin ─────────────────────────────────────────── */}
            <section className="rounded-2xl border border-system-color-03/25 bg-system-color-03/5 p-4 sm:p-5 space-y-4">
                <header className="flex items-center gap-2 text-system-color-03 font-bold text-sm pb-3 border-b border-system-color-03/15">
                    <PlaneTakeoff size={15} aria-hidden />
                    <span>Origin</span>
                </header>
                <Select
                    id="originCountry"
                    name="originCountry"
                    label="Country"
                    value={form.originCountry}
                    onChange={handleChange}
                    options={countryOptions}
                />
                <Input
                    id="originAirport"
                    name="originAirport"
                    label="Airport / City"
                    value={form.originAirport}
                    onChange={handleChange}
                    placeholder="e.g. Dubai (DXB)"
                />
            </section>

            {/* ── Destination ────────────────────────────────────── */}
            <section className="rounded-2xl border border-system-color-02/25 bg-system-color-02/5 p-4 sm:p-5 space-y-4">
                <header className="flex items-center gap-2 text-system-color-02 font-bold text-sm pb-3 border-b border-system-color-02/15">
                    <MapPin size={15} aria-hidden />
                    <span>Destination</span>
                </header>
                <Select
                    id="destinationCountry"
                    name="destinationCountry"
                    label="Country"
                    value={form.destinationCountry}
                    onChange={handleChange}
                    options={countryOptions}
                />
                <Input
                    id="destinationAirport"
                    name="destinationAirport"
                    label="Airport / City"
                    value={form.destinationAirport}
                    onChange={handleChange}
                    placeholder="e.g. London (LHR)"
                />
            </section>

            {/* ── Schedule ───────────────────────────────────────── */}
            <section className="rounded-2xl border border-brand-text-03/25 bg-brand-text-03/5 p-4 sm:p-5 space-y-4">
                <header className="flex items-center gap-2 text-brand-text-03 font-bold text-sm pb-3 border-b border-brand-text-03/15">
                    <Calendar size={15} aria-hidden />
                    <span>Schedule</span>
                </header>
                {/*
                  * value MUST be YYYY-MM-DD — toDateInputValue() guarantees this
                  * even when Supabase returns a full ISO timestamp string.
                  */}
                <Input
                    id="travelDate"
                    name="travelDate"
                    type="date"
                    label="Scheduled Departure"
                    value={form.travelDate}
                    onChange={handleChange}
                />
                <Select
                    id="transportMode"
                    name="transportMode"
                    label="Transport Mode"
                    value={form.transportMode}
                    onChange={handleChange}
                    options={transportOptions}
                />
            </section>

            {/* ── Submit ─────────────────────────────────────────── */}
            <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-system-color-03 text-white font-semibold text-sm
                           hover:opacity-90 active:scale-[0.98] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? 'Saving…' : 'Save Journey Details'}
            </button>
        </form>
    );
}
