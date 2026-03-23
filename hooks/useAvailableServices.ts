import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { detectBookingContext } from '@/utils/bookingLogic';
import { Service } from '@/types/service';
import useBookingStore from '@/lib/store/booking-store';

interface TravelDetails {
    originCountry: string;
    destinationCountry: string;
    transportMode?: string;
}

interface Pet {
    species_id?: number | string;
    speciesName?: string;
}

interface SpeciesRecord {
    id: number | string;
    name: string;
}

interface BookingCache {
    services: Service[] | null;
    servicesKey: string | null;
    species: SpeciesRecord[] | null;
}

/**
 * Fetches the list of services valid for the current travel + pet configuration.
 *
 * Cache-first strategy:
 *   1. Check Zustand `_cache.services` — if the cache key matches the current
 *      travel config + pet species, return cached data instantly (0ms, no spinner).
 *   2. Otherwise, fall back to the client-side `get_valid_services` RPC.
 *
 * Race-condition safe: uses a stale-closure guard so that if inputs change while
 * a fetch is in-flight, the outdated response is discarded.
 */
export function useAvailableServices(travelDetails: TravelDetails, pets: Pet[]) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Read prefetch cache with explicit types (store is untyped JS)
    const cachedServices = useBookingStore((s: { _cache: BookingCache }) => s._cache.services);
    const cachedKey = useBookingStore((s: { _cache: BookingCache }) => s._cache.servicesKey);
    const cachedSpecies = useBookingStore((s: { _cache: BookingCache }) => s._cache.species);
    const setCacheData = useBookingStore(
        (s: { setCacheData: (key: string, data: unknown) => void }) => s.setCacheData,
    );

    // Derive a stable dependency key from the actual values that matter,
    // instead of object references that change on every Zustand update.
    const depKey = useMemo(() => {
        const origin = travelDetails?.originCountry || '';
        const dest = travelDetails?.destinationCountry || '';
        const mode = travelDetails?.transportMode || 'manifest_cargo';
        const speciesIds = (pets || [])
            .map(p => String(p.species_id || ''))
            .filter(Boolean)
            .sort()
            .join(',');
        return `${origin}|${dest}|${mode}|${speciesIds}`;
    }, [
        travelDetails?.originCountry,
        travelDetails?.destinationCountry,
        travelDetails?.transportMode,
        pets,
    ]);

    useEffect(() => {
        // Stale-closure guard: if inputs change while fetch is in-flight,
        // the outdated response is discarded instead of overwriting state.
        let cancelled = false;

        const fetchServices = async () => {
            setLoading(true);
            try {
                const serviceType = detectBookingContext(
                    travelDetails.originCountry,
                    travelDetails.destinationCountry,
                );
                const transportMode = travelDetails.transportMode || 'manifest_cargo';

                // Build species lookup — prefer cached species to avoid an extra query
                const speciesMap = new Map<string, string>();
                if (cachedSpecies && cachedSpecies.length > 0) {
                    cachedSpecies.forEach(
                        (s) => speciesMap.set(String(s.id), s.name),
                    );
                } else if (pets && pets.length > 0) {
                    const { data: speciesData } = await supabase
                        .from('species')
                        .select('id, name');
                    if (cancelled) return;
                    if (speciesData) {
                        speciesData.forEach((s) => speciesMap.set(String(s.id), s.name));
                    }
                }

                const uniqueSpecies = [
                    ...new Set(
                        pets
                            .map(
                                (p) =>
                                    speciesMap.get(String(p.species_id)) ||
                                    p.speciesName ||
                                    '',
                            )
                            .filter(Boolean),
                    ),
                ];

                // ── Cache hit check ───────────────────────────────────────────────
                const expectedKey = `${serviceType}|${transportMode}|${[...uniqueSpecies].sort().join(',')}`;
                if (cachedKey === expectedKey && cachedServices) {
                    if (!cancelled) {
                        setServices(cachedServices);
                        setLoading(false);
                    }
                    return;
                }

                // ── Cache miss → live RPC fetch ──────────────────────────────────
                const { data: filteredServices, error } = await supabase.rpc(
                    'get_valid_services',
                    {
                        target_type: serviceType,
                        target_mode: transportMode,
                        pet_species: uniqueSpecies,
                    },
                );

                if (cancelled) return;
                if (error) throw error;

                const result: Service[] = filteredServices || [];
                setServices(result);

                // Warm cache for future visits
                setCacheData('services', result);
                setCacheData('servicesKey', expectedKey);
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching services:', err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            cancelled = true;
        };
    }, [depKey]); // eslint-disable-line react-hooks/exhaustive-deps

    return { services, loading };
}
