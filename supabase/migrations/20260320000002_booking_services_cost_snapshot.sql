-- Migration: Snapshot cost, tax rate, and pricing model on booking_services
-- Preserves the financial terms at the moment of booking so price changes
-- to the service catalog don't retroactively alter existing bookings.

ALTER TABLE booking_services
    ADD COLUMN IF NOT EXISTS unit_cost     NUMERIC(10, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_rate      NUMERIC(5, 2)  DEFAULT 5.0,
    ADD COLUMN IF NOT EXISTS pricing_model TEXT           DEFAULT 'fixed'
        CHECK (pricing_model IN ('fixed', 'per_kg', 'per_km', 'per_day', 'per_item', 'percentage'));
