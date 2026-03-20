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
                // Determine search modes
                const isPossibleBooking = /^PP-/i.test(trimmedQuery) || /^\d{2,}$/.test(trimmedQuery);
                const isPossibleEmail = trimmedQuery.includes('@');
                const isPossiblePhone = /^\+?[\d\s-]{4,}$/.test(trimmedQuery);

                // Initialize queries
                const promises = [];

                // 1. Search Bookings Direct
                let bookingPromise = null;
                if (isPossibleBooking) {
                    bookingPromise = supabase
                        .from('bookings')
                        .select('id, booking_number, status, customer:customer_id(display_name)')
                        .ilike('booking_number', `%${trimmedQuery}%`)
                        .limit(5);
                    promises.push(bookingPromise);
                }

                // 2. Search Entities (Customers)
                let entityPromise = null;
                if (isPossibleEmail) {
                    entityPromise = supabase
                        .from('entities')
                        .select('id, display_name, contact_info')
                        .ilike('contact_info->>email', `%${trimmedQuery}%`)
                        .limit(5);
                } else if (isPossiblePhone) {
                    entityPromise = supabase
                        .from('entities')
                        .select('id, display_name, contact_info')
                        .ilike('contact_info->>phone', `%${trimmedQuery}%`)
                        .limit(5);
                } else {
                    entityPromise = supabase
                        .from('entities')
                        .select('id, display_name, contact_info')
                        .or(`display_name.ilike.%${trimmedQuery}%,code.ilike.%${trimmedQuery}%`)
                        .limit(5);
                }
                promises.push(entityPromise);

                // 3. Search Pets, Breeds, Nodes (if not email/phone)
                let petPromise = null;
                let breedPromise = null;
                let nodePromise = null;

                if (!isPossibleEmail && !isPossiblePhone) {
                    petPromise = supabase
                        .from('pets')
                        .select('id, name')
                        .ilike('name', `%${trimmedQuery}%`)
                        .limit(5);
                    promises.push(petPromise);

                    breedPromise = supabase
                        .from('breeds')
                        .select('id, name')
                        .ilike('name', `%${trimmedQuery}%`)
                        .limit(5);
                    promises.push(breedPromise);

                    nodePromise = supabase
                        .from('logistics_nodes')
                        .select('id, name, city, iata_code')
                        .or(`name.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%,iata_code.ilike.%${trimmedQuery}%`)
                        .limit(5);
                    promises.push(nodePromise);
                }

                // Wait for initial matches
                const resultsArray = await Promise.all(promises);

                let bookingRes = isPossibleBooking ? resultsArray.shift() : { data: null };
                let entityRes = resultsArray.shift() || { data: null };
                let petRes = petPromise ? resultsArray.shift() : { data: null };
                let breedRes = breedPromise ? resultsArray.shift() : { data: null };
                let nodeRes = nodePromise ? resultsArray.shift() : { data: null };

                const allBookingHits: SearchResult[] = [];
                const seenBookingNumbers = new Set<string>();

                const addBooking = (b: any, type: 'booking' | 'customer' | 'pet', title: string, subtitle: string) => {
                    const bNumber = b.booking_number;
                    if (bNumber && !seenBookingNumbers.has(bNumber)) {
                        seenBookingNumbers.add(bNumber);
                        allBookingHits.push({
                            id: b.id || bNumber,
                            type,
                            title,
                            subtitle,
                            url: `/admin/relocations/${bNumber}`
                        });
                    }
                };

                // Add direct booking hits
                if (bookingRes?.data) {
                    bookingRes.data.forEach((b: any) => {
                        const customerName = b.customer?.display_name || 'Booking';
                        addBooking(b, 'booking', b.booking_number, `Booking • Status: ${b.status || 'N/A'}`);
                    });
                }

                // Add booking hits via customer
                if (entityRes?.data && entityRes.data.length > 0) {
                    const customerIds = entityRes.data.map((e: any) => e.id);
                    const { data: customerBookings } = await supabase
                        .from('bookings')
                        .select('id, booking_number, status, customer_id')
                        .in('customer_id', customerIds)
                        .limit(10);

                    if (customerBookings) {
                        customerBookings.forEach((b: any) => {
                            const customer = entityRes.data.find((e: any) => e.id === b.customer_id);
                            if (customer) {
                                addBooking(b, 'customer', b.booking_number, `Customer: ${customer.display_name} • ${b.status || 'N/A'}`);
                            }
                        });
                    }
                }

                // Add booking hits via pet & breed
                const petMap = new Map();
                if (petRes?.data) {
                    petRes.data.forEach((p: any) => petMap.set(p.id, { name: p.name, source: 'name' }));
                }

                if (breedRes?.data && breedRes.data.length > 0) {
                    const breedIds = breedRes.data.map((b: any) => b.id);
                    const { data: petsWithBreed } = await supabase
                        .from('pets')
                        .select('id, name, breed_id')
                        .in('breed_id', breedIds)
                        .limit(10);

                    if (petsWithBreed) {
                        petsWithBreed.forEach((p: any) => {
                            if (!petMap.has(p.id)) {
                                const breedName = breedRes.data.find((b: any) => b.id === p.breed_id)?.name;
                                petMap.set(p.id, { name: p.name, source: 'breed', breedName });
                            }
                        });
                    }
                }

                if (petMap.size > 0) {
                    const petIds = Array.from(petMap.keys());
                    const { data: bookingPets } = await supabase
                        .from('booking_pets')
                        .select('pet_id, booking:bookings(id, booking_number, status)')
                        .in('pet_id', petIds)
                        .limit(10);

                    if (bookingPets) {
                        bookingPets.forEach((bp: any) => {
                            const petInfo = petMap.get(bp.pet_id);
                            const bRaw = bp.booking;
                            const b = Array.isArray(bRaw) ? bRaw[0] : bRaw;

                            if (petInfo && b && b.booking_number) {
                                let subtitle = petInfo.source === 'breed'
                                    ? `Breed: ${petInfo.breedName} (Pet: ${petInfo.name}) • ${b.status || 'N/A'}`
                                    : `Pet: ${petInfo.name} • ${b.status || 'N/A'}`;
                                addBooking(b, 'pet', b.booking_number, subtitle);
                            }
                        });
                    }
                }

                // Add booking hits via Origin/Destination nodes
                if (nodeRes?.data && nodeRes.data.length > 0) {
                    const nodeIds = nodeRes.data.map((n: any) => n.id);

                    const [originRes, destRes] = await Promise.all([
                        supabase.from('bookings').select('id, booking_number, status, origin_node_id').in('origin_node_id', nodeIds).limit(5),
                        supabase.from('bookings').select('id, booking_number, status, destination_node_id').in('destination_node_id', nodeIds).limit(5)
                    ]);

                    const processNodeBookings = (nodeBookings: any[], isOrigin: boolean) => {
                        if (nodeBookings) {
                            nodeBookings.forEach((b: any) => {
                                const nodeId = isOrigin ? b.origin_node_id : b.destination_node_id;
                                const matchedNode = nodeRes.data.find((n: any) => n.id === nodeId);
                                if (matchedNode) {
                                    const locationStr = [matchedNode.name, matchedNode.city, matchedNode.iata_code].filter(Boolean).join(', ');
                                    const direction = isOrigin ? 'Origin' : 'Dest';
                                    addBooking(b, 'booking', b.booking_number, `${direction}: ${locationStr} • ${b.status || 'N/A'}`);
                                }
                            });
                        }
                    };

                    processNodeBookings(originRes.data || [], true);
                    processNodeBookings(destRes.data || [], false);
                }

                newResults = allBookingHits;

                if (currentSearchId === searchIdRef.current) {
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
