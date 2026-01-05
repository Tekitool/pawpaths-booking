-- 1. Create the Marketing Badge Enum
DO $$ BEGIN
    CREATE TYPE promo_badge_enum AS ENUM ('none', 'complimentary', 'bestseller', 'limited_offer', 'essential');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure service_type_enum exists
DO $$ BEGIN
    CREATE TYPE service_type_enum AS ENUM ('export', 'import', 'local', 'domestic', 'transit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure transport_mode_enum exists
DO $$ BEGIN
    CREATE TYPE transport_mode_enum AS ENUM ('manifest_cargo', 'in_cabin', 'excess_baggage', 'private_charter', 'ground_transport');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Rename old applicability column to preserve data (just in case)
ALTER TABLE service_catalog RENAME COLUMN applicability TO legacy_applicability;

-- 3. Add the 3-Axis Filtering Columns (Arrays)
-- Defaulting to '{}' (Empty Array) implies "Applies to ALL" (Wildcard Rule)
ALTER TABLE service_catalog ADD COLUMN valid_species text[] DEFAULT '{}';
ALTER TABLE service_catalog ADD COLUMN valid_service_types service_type_enum[] DEFAULT '{}';
ALTER TABLE service_catalog ADD COLUMN valid_transport_modes transport_mode_enum[] DEFAULT '{}';

-- 4. Add the Marketing Column
ALTER TABLE service_catalog ADD COLUMN promo_badge promo_badge_enum DEFAULT 'none';

-- 5. Add GIN Indexes for High-Performance Filtering
CREATE INDEX IF NOT EXISTS idx_service_catalog_species ON service_catalog USING GIN (valid_species);
CREATE INDEX IF NOT EXISTS idx_service_catalog_types ON service_catalog USING GIN (valid_service_types);
CREATE INDEX IF NOT EXISTS idx_service_catalog_modes ON service_catalog USING GIN (valid_transport_modes);

-- 6. Comment for Documentation
COMMENT ON COLUMN service_catalog.valid_service_types IS 'Empty array means ALL types. Specific values limit visibility.';
