-- 1. Create the detailed Transport Mode Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transport_mode_enum') THEN
        CREATE TYPE transport_mode_enum AS ENUM (
            'manifest_cargo',   -- Unaccompanied (Pet flies alone in cargo hold)
            'excess_baggage',   -- Accompanied (Pet flies in cargo hold, but on owner's ticket)
            'in_cabin',         -- Accompanied (Pet flies in seat with owner)
            'ground_transport', -- Road travel (Local/Domestic)
            'private_charter'   -- VIP Jet
        );
    END IF;
END$$;

-- 2. Add the "transport_mode" column to the Bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS transport_mode transport_mode_enum DEFAULT 'manifest_cargo';

-- 3. Create an index for faster filtering
DROP INDEX IF EXISTS idx_bookings_transport_mode;
CREATE INDEX idx_bookings_transport_mode ON bookings(transport_mode);
