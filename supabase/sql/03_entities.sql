-- ============================================================================
-- 03_entities.sql
-- ENTITIES (Unified CRM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.entities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id),
  code TEXT UNIQUE,
  type entity_type_enum DEFAULT 'individual',
  is_client BOOLEAN DEFAULT false,
  is_vendor BOOLEAN DEFAULT false,
  display_name TEXT NOT NULL,
  company_name TEXT,
  tax_id TEXT,
  currency CHAR(3) DEFAULT 'AED',
  contact_info JSONB DEFAULT '{}',
  billing_address JSONB DEFAULT '{}',
  shipping_address JSONB DEFAULT '{}',
  payment_terms TEXT DEFAULT 'immediate', 
  credit_limit NUMERIC(12,2) DEFAULT 0.00,
  balance_receivable NUMERIC(12,2) DEFAULT 0.00,
  balance_payable NUMERIC(12,2) DEFAULT 0.00,
  kyc_status TEXT DEFAULT 'pending',
  kyc_documents JSONB DEFAULT '[]',
  tags TEXT[],
  is_vip BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes (IF NOT EXISTS is not standard in all PG versions for INDEX, so we use DROP first or ignore error)
DROP INDEX IF EXISTS idx_entities_search;
CREATE INDEX idx_entities_search ON entities USING gin(to_tsvector('english', display_name || ' ' || COALESCE(company_name, '')));

DROP INDEX IF EXISTS idx_entities_profile;
CREATE INDEX idx_entities_profile ON entities(profile_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_entities ON public.entities;
CREATE TRIGGER set_updated_at_entities
BEFORE UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Entity Code Generator
CREATE OR REPLACE FUNCTION generate_entity_code()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    sequence_num INT;
BEGIN
    IF NEW.code IS NULL THEN
        IF NEW.is_client THEN prefix := 'CUS-';
        ELSIF NEW.is_vendor THEN prefix := 'VEN-';
        ELSE prefix := 'ENT-';
        END IF;
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
        INTO sequence_num FROM entities WHERE code LIKE prefix || '%';
        
        NEW.code := prefix || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_entity_code ON public.entities;
CREATE TRIGGER set_entity_code
BEFORE INSERT ON public.entities
FOR EACH ROW EXECUTE FUNCTION generate_entity_code();
