import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { detectBookingContext } from '@/utils/bookingLogic';

export function useAvailableServices(travelDetails: any, pets: any[]) {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                // 1. Fetch Services
                const { data: servicesData, error: servicesError } = await supabase
                    .from('service_catalog')
                    .select('*')
                    .eq('is_active', true);

                if (servicesError) throw servicesError;

                // 2. Fetch Species to map IDs to Names (if pets exist)
                let speciesMap = new Map<string, string>();
                if (pets && pets.length > 0) {
                    const { data: speciesData } = await supabase
                        .from('species')
                        .select('id, name');

                    if (speciesData) {
                        speciesData.forEach(s => speciesMap.set(String(s.id), s.name));
                    }
                }

                // 3. Client-side Filtering
                const serviceType = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);
                const transportMode = travelDetails.transportMode || 'manifest_cargo';

                const userSpecies = pets.map(p => {
                    // Try to get name from map, or use p.speciesName if available, or fallback
                    return speciesMap.get(String(p.species_id)) || p.speciesName || '';
                }).filter(Boolean);

                const filtered = servicesData.filter(service => {
                    // A. Service Type Logic
                    // Empty = All. Otherwise must include detected type.
                    const typeMatch = !service.valid_service_types || service.valid_service_types.length === 0 || service.valid_service_types.includes(serviceType);

                    // B. Transport Mode Logic
                    // Empty = All. Otherwise must include user's mode.
                    const modeMatch = !service.valid_transport_modes || service.valid_transport_modes.length === 0 || service.valid_transport_modes.includes(transportMode);

                    // C. Species Logic
                    // Empty = All. Otherwise must overlap with user's pets.
                    let speciesMatch = true;
                    if (service.valid_species && service.valid_species.length > 0) {
                        if (userSpecies.length === 0) {
                            speciesMatch = false;
                        } else {
                            // Check for intersection
                            speciesMatch = service.valid_species.some((s: string) => userSpecies.includes(s));
                        }
                    }

                    return typeMatch && modeMatch && speciesMatch;
                });

                setServices(filtered);
            } catch (err) {
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [travelDetails, pets]);

    return { services, loading };
}
