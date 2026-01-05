import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { detectBookingContext } from '@/utils/bookingLogic';
import { Service } from '@/types/service';

export function useAvailableServices(travelDetails: any, pets: any[]) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                // 1. Prepare RPC Arguments
                const serviceType = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);
                const transportMode = travelDetails.transportMode || 'manifest_cargo';

                // Map pets to species names for filtering
                let speciesMap = new Map<string, string>();
                if (pets && pets.length > 0) {
                    const { data: speciesData } = await supabase
                        .from('species')
                        .select('id, name');

                    if (speciesData) {
                        speciesData.forEach(s => speciesMap.set(String(s.id), s.name));
                    }
                }

                const userSpecies = pets.map(p => {
                    return speciesMap.get(String(p.species_id)) || p.speciesName || '';
                }).filter(Boolean);

                // Unique species list for RPC
                const uniqueSpecies = [...new Set(userSpecies)];

                console.log('Fetching services via RPC:', {
                    target_type: serviceType,
                    target_mode: transportMode,
                    pet_species: uniqueSpecies
                });

                // 2. Call the Smart Filter RPC
                const { data: filteredServices, error } = await supabase
                    .rpc('get_valid_services', {
                        target_type: serviceType,
                        target_mode: transportMode,
                        pet_species: uniqueSpecies
                    });

                if (error) throw error;

                setServices(filteredServices || []);

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
