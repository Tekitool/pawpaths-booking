-- ============================================================================
-- 06_geography.sql
-- GEOGRAPHY & NODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.countries (
  id INT PRIMARY KEY,
  iso_code CHAR(2) UNIQUE,
  iso_code_3 CHAR(3) UNIQUE,
  name TEXT UNIQUE,
  currency_code CHAR(3),
  phone_code TEXT,
  timezone TEXT,
  requires_import_permit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_type node_type_enum,
  name TEXT NOT NULL,
  iata_code CHAR(3),
  city TEXT,
  country_id INT REFERENCES public.countries(id),
  coordinates GEOGRAPHY(POINT),
  address JSONB,
  timezone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_nodes_coordinates;
CREATE INDEX idx_nodes_coordinates ON logistics_nodes USING gist(coordinates);
