-- ============================================================================
-- 07_services.sql
-- SERVICE CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.service_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.service_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE,
  category_id INT REFERENCES public.service_categories(id),
  name TEXT NOT NULL,
  applicability TEXT[],
  base_price NUMERIC(12,2) DEFAULT 0.00,
  base_cost NUMERIC(12,2) DEFAULT 0.00,
  pricing_model pricing_model_enum,
  tax_rate NUMERIC(5,2) DEFAULT 5.00,
  icon TEXT DEFAULT 'Box',
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_services ON public.service_catalog;
CREATE TRIGGER set_updated_at_services
BEFORE UPDATE ON public.service_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
