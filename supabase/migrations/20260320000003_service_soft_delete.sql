-- Migration: Soft-delete for service_catalog
-- Services are never hard-deleted; deleted_at marks removal while preserving
-- historical references from booking_services and finance_items.

ALTER TABLE service_catalog
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_service_catalog_active
    ON service_catalog(deleted_at)
    WHERE deleted_at IS NULL;
