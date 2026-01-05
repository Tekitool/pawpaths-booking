-- 1. Add new columns to service_catalog table
ALTER TABLE service_catalog 
ADD COLUMN IF NOT EXISTS scope text CHECK (scope IN ('per_booking', 'per_pet')) DEFAULT 'per_booking',
ADD COLUMN IF NOT EXISTS is_recommended boolean DEFAULT false;

-- 2. Create the Smart Filter RPC function
CREATE OR REPLACE FUNCTION get_valid_services(
    target_type text,
    target_mode text,
    pet_species text[]
)
RETURNS SETOF service_catalog
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM service_catalog
    WHERE is_active = true
    -- Service Type Logic: Match target_type OR array is empty/null
    AND (
        valid_service_types IS NULL 
        OR cardinality(valid_service_types) = 0 
        OR target_type = ANY(valid_service_types::text[])
    )
    -- Transport Mode Logic: Match target_mode OR array is empty/null
    AND (
        valid_transport_modes IS NULL 
        OR cardinality(valid_transport_modes) = 0 
        OR target_mode = ANY(valid_transport_modes::text[])
    )
    -- Species Logic: Overlap with input species OR array is empty/null
    AND (
        valid_species IS NULL 
        OR cardinality(valid_species) = 0 
        OR valid_species && pet_species
    )
    ORDER BY base_price ASC;
$$;
