import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export type SearchResult = {
    id: string;
    type: 'booking' | 'customer' | 'pet';
    title: string;
    subtitle: string;
    url: string;
};

export function useSmartSearch(query: string) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchIdRef = useRef(0);

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        searchIdRef.current += 1;
        const currentSearchId = searchIdRef.current;

        const performSearch = async () => {
            setIsSearching(true);
            let newResults: SearchResult[] = [];

            try {
                console.log('Performing search for:', trimmedQuery);

                // MODE A: Booking Lookup
                if (/^PP-/i.test(trimmedQuery) || /^\d{4,}$/.test(trimmedQuery)) {
                    console.log('Mode A: Booking search');

                    // Check authentication
                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    console.log('DEBUG - Current user:', user);
                    console.log('DEBUG - Auth error:', authError);

                    // Check if we can access bookings at all
                    const { data: allBookings, error: debugError } = await supabase
                        .from('bookings')
                        .select('id, booking_number, status')
                        .limit(5);

                    console.log('DEBUG - All bookings (first 5):', allBookings);
                    console.log('DEBUG - Error:', debugError);

                    // Try exact match
                    const { data: exactMatch, error: exactError } = await supabase
                        .from('bookings')
                        .select('id, booking_number, status')
                        .eq('booking_number', trimmedQuery)
                        .maybeSingle();

                    console.log('DEBUG - Exact match for', trimmedQuery, ':', exactMatch);
                    console.log('DEBUG - Exact match error:', exactError);

                    // Try wildcard search
                    const { data, error } = await supabase
                        .from('bookings')
                        .select('id, booking_number, status')
                        .ilike('booking_number', `%${trimmedQuery}%`)
                        .limit(5);

                    console.log('Booking filtered results:', data);
                    console.log('Booking search error:', error);

                    if (data) {
                        newResults = data.map(b => ({
                            id: b.id,
                            type: 'booking',
                            title: b.booking_number,
                            subtitle: `Status: ${b.status}`,
                            url: `/admin/relocations/${b.booking_number}`
                        }));
                    }
                }
                // MODE B: Email
                else if (trimmedQuery.includes('@')) {
                    const { data } = await supabase
                        .from('entities')
                        .select('id, display_name, contact_info')
                        .limit(50);

                    const filtered = data?.filter(c => {
                        const email = c.contact_info?.email;
                        return email && email.toLowerCase().includes(trimmedQuery.toLowerCase());
                    }) || [];

                    newResults = filtered.slice(0, 5).map(c => ({
                        id: c.id,
                        type: 'customer',
                        title: c.display_name,
                        subtitle: c.contact_info?.email || 'No Email',
                        url: `/admin/customers/${c.id}`
                    }));
                }
                // MODE C: Phone
                else if (/^\+?[\d\s-]{5,}$/.test(trimmedQuery)) {
                    const { data } = await supabase
                        .from('entities')
                        .select('id, display_name, contact_info')
                        .limit(50);

                    const filtered = data?.filter(c => {
                        const phone = c.contact_info?.phone;
                        return phone && phone.includes(trimmedQuery);
                    }) || [];

                    newResults = filtered.slice(0, 5).map(c => ({
                        id: c.id,
                        type: 'customer',
                        title: c.display_name,
                        subtitle: c.contact_info?.phone || 'No Phone',
                        url: `/admin/customers/${c.id}`
                    }));
                }
                // MODE D: Wildcard
                else {
                    const [customerRes, petRes] = await Promise.all([
                        supabase
                            .from('entities')
                            .select('id, display_name, contact_info')
                            .ilike('display_name', `%${trimmedQuery}%`)
                            .limit(3),

                        supabase
                            .from('booking_pets')
                            .select(`pet:pets!inner(id, name, species_id), booking:bookings!inner(customer_id)`)
                            .ilike('pets.name', `%${trimmedQuery}%`)
                            .limit(3)
                    ]);

                    const customerHits = (customerRes.data || []).map(c => ({
                        id: c.id,
                        type: 'customer' as const,
                        title: c.display_name,
                        subtitle: c.contact_info?.email || 'Customer',
                        url: `/admin/customers/${c.id}`
                    }));

                    const petHits = (petRes.data || []).map((item: any) => ({
                        id: item.pet.id,
                        type: 'pet' as const,
                        title: item.pet.name,
                        subtitle: item.pet.species_id === 1 ? 'Dog' : item.pet.species_id === 2 ? 'Cat' : 'Pet',
                        url: `/admin/customers/${item.booking?.customer_id}?pet=${item.pet.id}`
                    }));

                    newResults = [...customerHits, ...petHits];
                }

                if (currentSearchId === searchIdRef.current) {
                    console.log('Setting results:', newResults);
                    setResults(newResults);
                }

            } catch (error: any) {
                console.error('Search error:', error);
            } finally {
                if (currentSearchId === searchIdRef.current) {
                    setIsSearching(false);
                }
            }
        };

        const timeoutId = setTimeout(performSearch, 300);

        return () => {
            clearTimeout(timeoutId);
        };

    }, [query]);

    return { results, isSearching };
}
