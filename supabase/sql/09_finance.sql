-- ============================================================================
-- 09_finance.sql
-- FINANCE ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.finance_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doc_number TEXT UNIQUE,
  doc_type finance_doc_type_enum,
  booking_id UUID REFERENCES public.bookings(id),
  entity_id UUID REFERENCES public.entities(id),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  currency CHAR(3) DEFAULT 'AED',
  
  subtotal NUMERIC(12,2) DEFAULT 0.00,
  tax_total NUMERIC(12,2) DEFAULT 0.00,
  grand_total NUMERIC(12,2) DEFAULT 0.00,
  paid_amount NUMERIC(12,2) DEFAULT 0.00,
  balance_amount NUMERIC(12,2) DEFAULT 0.00,
  
  payment_status payment_status_type DEFAULT 'unpaid',
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.finance_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doc_id UUID REFERENCES public.finance_documents(id) ON DELETE CASCADE,
  description TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0.00,
  tax_rate NUMERIC(5,2) DEFAULT 5.00,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_finance_status;
CREATE INDEX idx_finance_status ON finance_documents(payment_status);

DROP TRIGGER IF EXISTS set_updated_at_finance ON public.finance_documents;
CREATE TRIGGER set_updated_at_finance
BEFORE UPDATE ON public.finance_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_finance_doc_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    year_part TEXT;
    sequence_num INT;
BEGIN
    IF NEW.doc_number IS NULL THEN
        CASE NEW.doc_type
            WHEN 'quotation' THEN prefix := 'EST-';
            WHEN 'invoice' THEN prefix := 'INV-';
            WHEN 'receipt' THEN prefix := 'RCT-';
            ELSE prefix := 'DOC-';
        END CASE;
        
        year_part := TO_CHAR(NOW(), 'YYYY');
        SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(doc_number, '^' || prefix || year_part || '-', '') AS INT)), 0) + 1
        INTO sequence_num FROM finance_documents WHERE doc_number LIKE prefix || year_part || '-%';
        
        NEW.doc_number := prefix || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_finance_doc_number ON public.finance_documents;
CREATE TRIGGER set_finance_doc_number
BEFORE INSERT ON public.finance_documents
FOR EACH ROW EXECUTE FUNCTION generate_finance_doc_number();
