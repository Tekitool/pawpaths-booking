import React from 'react';
import EnquiryWizard from '@/components/enquiry/EnquiryWizard';
import { createClient } from '@/lib/supabase/server';

// ── Performance: only fetch what Step 1 needs server-side ─────────────────────
// Species, breeds, and genderOptions are prefetched in the background by
// usePrefetchWizardData hook AFTER Step 1 mounts (see hooks/usePrefetchWizardData.js).
// This eliminates ~800-1200ms of blocking TTFB that was caused by awaiting
// 4 sequential Supabase queries before first paint.

export const metadata = {
    title: 'Start Your Relocation Enquiry | Pawpaths',
};

export default async function NewBookingPage() {
    const supabase = await createClient();

    // Countries: small dataset (~200 rows), needed immediately by Step 1 selects
    const { data: countriesList, error: countriesError } = await supabase
        .from('countries')
        .select('id, name, iso_code')
        .order('name');

    if (countriesError) {
        console.error('Error fetching countries:', countriesError);
    }

    return (
        <EnquiryWizard countriesList={countriesList || []} />
    );
}
