-- Migration: Add service_id FK to finance_items
-- Enables revenue-per-service analytics by linking invoice line items back to the service catalog.

ALTER TABLE finance_items
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_finance_items_service_id
    ON finance_items(service_id)
    WHERE service_id IS NOT NULL;
