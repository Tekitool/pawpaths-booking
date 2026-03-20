-- Migration: Service dependency and bundle rules
-- Defines relationships between services:
--   requires   → target must be added when this service is selected
--   conflicts  → target cannot coexist with this service
--   suggests   → target is recommended alongside this service

CREATE TABLE IF NOT EXISTS service_rules (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id        UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    rule_type         TEXT NOT NULL CHECK (rule_type IN ('requires', 'conflicts', 'suggests')),
    target_service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (service_id, rule_type, target_service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_rules_service_id
    ON service_rules(service_id);
