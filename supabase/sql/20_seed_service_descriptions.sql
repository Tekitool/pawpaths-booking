-- ============================================================================
-- 20_seed_service_descriptions.sql
-- Seed descriptions for existing services
-- ============================================================================

-- EXPORT SERVICES
UPDATE public.service_catalog
SET 
    short_description = 'MOCCAE Export Health Certificate.',
    long_description = 'Obtaining the official Export Health Certificate from the UAE Ministry. Valid for 30 days. Required for all pets leaving the UAE.',
    requirements = 'Vaccination Book, Microchip Certificate, Owner Passport Copy'
WHERE code = 'EXP-001';

UPDATE public.service_catalog
SET 
    short_description = 'Cargo flight reservation.',
    long_description = 'Booking of pet cargo space on the most direct and pet-friendly airlines. We handle the routing and airway bill generation.',
    requirements = 'Preferred Travel Dates, Consignee Details'
WHERE code = 'EXP-002';

UPDATE public.service_catalog
SET 
    short_description = 'Professional airport assistance.',
    long_description = 'Professional assistance at the airport departure terminal. We help with check-in, crate sealing, and porter services to ensure a smooth departure.',
    requirements = 'Flight Ticket, Pet in Crate'
WHERE code = 'EXP-003';

UPDATE public.service_catalog
SET 
    short_description = 'Mandatory pre-flight health check.',
    long_description = 'Physical examination by a licensed veterinarian within 24-48 hours of departure to certify the pet is fit for travel.',
    requirements = 'Pet must be present'
WHERE code = 'EXP-004';

UPDATE public.service_catalog
SET 
    short_description = 'Assistance for in-cabin travel.',
    long_description = 'Guidance and booking assistance for pets traveling in the cabin with their owners. Includes document verification.',
    requirements = 'Airline Approval, Soft Carrier'
WHERE code = 'EXP-005';

-- IMPORT SERVICES
UPDATE public.service_catalog
SET 
    short_description = 'UAE Import Permit.',
    long_description = 'Processing of the official Ministry of Climate Change and Environment (MOCCAE) Import Permit required for all pets entering the UAE.',
    requirements = 'Vaccination Record, Passport Copy'
WHERE code = 'IMP-001';

UPDATE public.service_catalog
SET 
    short_description = 'Official customs processing.',
    long_description = 'Complete handling of all customs formalities upon arrival. Includes document verification, duty payments, and release authorization.',
    requirements = 'Original Passport, Airway Bill, Health Certificate'
WHERE code = 'IMP-002';

UPDATE public.service_catalog
SET 
    short_description = 'Safe transport to your door.',
    long_description = 'Climate-controlled pet taxi service from the airport cargo terminal directly to your residence in the UAE.',
    requirements = 'Valid UAE Address, Receiver Contact Details'
WHERE code = 'IMP-003';

UPDATE public.service_catalog
SET 
    short_description = 'Mandatory arrival health check.',
    long_description = 'Coordination with Ministry of Climate Change and Environment (MOCCAE) vet for mandatory arrival inspection at the port of entry.',
    requirements = 'Pet must be present'
WHERE code = 'IMP-004';

-- LOCAL SERVICES
UPDATE public.service_catalog
SET 
    short_description = 'Transport within Dubai.',
    long_description = 'Safe, climate-controlled door-to-door transport for your pet within Dubai city limits.',
    requirements = 'Pickup and Drop-off Locations'
WHERE code = 'LOC-001';

UPDATE public.service_catalog
SET 
    short_description = 'Transport between Emirates.',
    long_description = 'Door-to-door transport between any two cities in the UAE (e.g., Dubai to Abu Dhabi). Fully climate controlled.',
    requirements = 'Pickup and Drop-off Locations'
WHERE code = 'LOC-002';

UPDATE public.service_catalog
SET 
    short_description = 'Temporary care during move.',
    long_description = 'Daytime care for your pet while moving logistics are handled. Includes feeding and walking.',
    requirements = 'Vaccination Up-to-Date'
WHERE code = 'LOC-003';

-- GENERAL SERVICES
UPDATE public.service_catalog
SET 
    short_description = 'Airline-approved travel crate.',
    long_description = 'Rental or purchase of a fully IATA-compliant travel crate sized perfectly for your pet. Includes water bowls and absorbent bedding.',
    requirements = 'Pet Measurements (Length, Height, Width)'
WHERE code = 'GEN-001';

UPDATE public.service_catalog
SET 
    short_description = 'Temporary stay at partner kennels.',
    long_description = 'Overnight boarding at our trusted partner facilities. Includes feeding, walking, and 24/7 supervision.',
    requirements = 'Vaccination Up-to-Date'
WHERE code = 'GEN-002';
