'use client';

// ─── Prefetch Orchestrator ────────────────────────────────────────────────────
// Silently prefetches JS bundles and Supabase data in the background while
// the user interacts with earlier wizard steps. When "Next" is clicked the
// target step mounts instantly — zero network wait.

import { useEffect, useRef } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { prefetchBreedData, prefetchServices } from '@/lib/actions/enquiry-prefetch-actions';
import { detectBookingContext } from '@/utils/bookingLogic';

// ── Dynamic component references (set by EnquiryWizard on init) ──────────────
// We accept these as arguments so the hook isn't coupled to specific imports.

/**
 * Injects `<link rel="prefetch">` tags for breed avatar images so the browser
 * downloads them during idle time. Capped to first 30 breeds to avoid flooding.
 */
function prefetchBreedAvatars(breeds) {
    if (typeof document === 'undefined') return [];
    const seen = new Set();
    const links = [];
    for (const b of breeds) {
        if (links.length >= 30) break;
        if (b.default_image_path && !seen.has(b.default_image_path)) {
            seen.add(b.default_image_path);
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = b.default_image_path;
            document.head.appendChild(link);
            links.push(link);
        }
    }
    return links;
}

/**
 * Build a stable cache key for the services RPC so we can skip re-fetching
 * when the travel config + pet species haven't changed.
 */
function buildServicesCacheKey(travelDetails, pets, speciesLookup) {
    const type = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);
    const mode = travelDetails.transportMode || 'manifest_cargo';
    const speciesNames = [...new Set(
        pets
            .map(p => speciesLookup?.get(String(p.species_id)) || p.speciesName || '')
            .filter(Boolean)
    )].sort();
    return `${type}|${mode}|${speciesNames.join(',')}`;
}

/**
 * Main prefetch hook — consumed by EnquiryWizard.
 *
 * @param {number}  currentStep        Current wizard step (1-6)
 * @param {object}  formData           Full form state from Zustand
 * @param {object}  dynamicComponents  Map of { Step2, Step3, Step4, Step5 } dynamic components (for .preload())
 */
export function usePrefetchWizardData(currentStep, formData, dynamicComponents = {}) {
    const setCacheData = useBookingStore((s) => s.setCacheData);
    const cache = useBookingStore((s) => s._cache);
    const prefetchedRef = useRef(false); // guards one-shot breed prefetch

    // ── Phase A: On Step 1 mount → prefetch Step 2 bundle + breed data ────────
    useEffect(() => {
        if (currentStep !== 1) return;

        // 1. Preload Step2 JS bundle immediately (0ms)
        dynamicComponents.Step2?.preload?.();

        // 2. Prefetch breed data after 1s idle
        if (prefetchedRef.current) return;
        let avatarLinks = [];
        const timer = setTimeout(async () => {
            if (prefetchedRef.current) return;
            prefetchedRef.current = true;

            try {
                const data = await prefetchBreedData();
                setCacheData('species', data.species);
                setCacheData('breeds', data.breeds);
                setCacheData('genderOptions', data.genderOptions);

                // 3. Prefetch breed avatar images (~1.5s after mount)
                if (data.breeds?.length) {
                    avatarLinks = prefetchBreedAvatars(data.breeds);
                }
            } catch (err) {
                // Non-critical — Step2 will fallback to live fetch
                console.warn('[prefetch] breed data failed, Step2 will fetch on mount:', err);
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
            avatarLinks.forEach(link => link.remove());
        };
    }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Phase B: On Step 2 mount → preload Step 3 bundle ──────────────────────
    useEffect(() => {
        if (currentStep !== 2) return;
        dynamicComponents.Step3?.preload?.();
    }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Phase B2: While on Step 2 — prefetch services when species is known ───
    useEffect(() => {
        if (currentStep !== 2) return;
        const { travelDetails, pets } = formData;
        if (!pets.length || !pets[0].species_id) return;
        if (!cache.species) return; // need species lookup to resolve names

        // Build lookup map from cached species
        const speciesLookup = new Map(cache.species.map(s => [String(s.id), s.name]));
        const key = buildServicesCacheKey(travelDetails, pets, speciesLookup);
        if (cache.servicesKey === key) return; // already cached for this config

        const speciesNames = [...new Set(
            pets.map(p => speciesLookup.get(String(p.species_id)) || '').filter(Boolean)
        )];
        const type = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);
        const mode = travelDetails.transportMode || 'manifest_cargo';

        prefetchServices(type, mode, speciesNames)
            .then(services => {
                setCacheData('services', services);
                setCacheData('servicesKey', key);
            })
            .catch(() => { /* non-critical */ });
    }, [currentStep, formData.pets, formData.travelDetails, cache.species]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Phase C: Preload subsequent step bundles ──────────────────────────────
    useEffect(() => {
        if (currentStep === 3) dynamicComponents.Step4?.preload?.();
        if (currentStep === 4) dynamicComponents.Step5?.preload?.();
    }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps
}
