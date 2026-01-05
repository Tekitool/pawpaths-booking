-- ============================================================================
-- 05_pets.sql
-- PETS (Passengers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  species_id INT REFERENCES public.species(id),
  breed_id INT REFERENCES public.breeds(id),
  date_of_birth DATE,
  is_dob_estimated BOOLEAN DEFAULT false,
  age_years INT, 
  age_months INT, 
  gender pet_gender_enum,
  weight_kg NUMERIC(6,2),
  microchip_id TEXT,
  passport_number TEXT,
  medical_alerts JSONB DEFAULT '[]',
  dims_length_a NUMERIC(5,2),
  dims_height_b NUMERIC(5,2),
  dims_width_c NUMERIC(5,2),
  dims_height_d NUMERIC(5,2),
  calculated_crate_size TEXT,
  photos JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS set_updated_at_pets ON public.pets;
CREATE TRIGGER set_updated_at_pets
BEFORE UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
