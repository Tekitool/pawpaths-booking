-- ============================================================================
-- 04_taxonomy.sql
-- PET TAXONOMY (Species & Breeds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.species (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  scientific_name TEXT,
  iata_code TEXT,
  is_restricted_global BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.breeds (
  id SERIAL PRIMARY KEY,
  species_id INT REFERENCES public.species(id),
  name TEXT NOT NULL,
  is_brachycephalic BOOLEAN DEFAULT false,
  is_restricted BOOLEAN DEFAULT false,
  iata_crate_rule TEXT,
  avg_weight_kg NUMERIC(5,2),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(species_id, name)
);
