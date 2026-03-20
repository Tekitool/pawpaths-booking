-- Migration: Country-specific price overrides for service_catalog
-- Allows setting a different customer price and/or cost for each country,
-- supporting region-based pricing without duplicating the service record.

CREATE TABLE IF NOT EXISTS service_price_overrides (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID    NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    country_code    CHAR(2) NOT NULL,   -- ISO 3166-1 alpha-2 (e.g. 'AE', 'GB', 'US')
    price_override  NUMERIC(10, 2),
    cost_override   NUMERIC(10, 2),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (service_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_spo_service_id
    ON service_price_overrides(service_id)
    WHERE is_active = true;
