-- Migration: Service price history / versioning
-- Every time base_price, base_cost, or tax_rate is changed, the OLD values
-- are written here before the update is applied, providing a full audit trail.

CREATE TABLE IF NOT EXISTS service_price_history (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id   UUID        NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    base_price   NUMERIC(10, 2) NOT NULL,
    base_cost    NUMERIC(10, 2) NOT NULL,
    tax_rate     NUMERIC(5, 2)  NOT NULL,
    changed_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    change_note  TEXT,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sph_service_effective
    ON service_price_history(service_id, effective_at DESC);
