-- Migration: Unit of Measure (UOM) for service_catalog
-- Ties the pricing_model to a human-readable unit label shown on invoices
-- and quotes (e.g. "per kg", "per day", "per item").

ALTER TABLE service_catalog
    ADD COLUMN IF NOT EXISTS uom TEXT DEFAULT 'service'
        CHECK (uom IN ('service', 'kg', 'km', 'day', 'item', 'percentage'));
