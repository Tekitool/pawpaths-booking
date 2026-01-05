-- ============================================================================
-- 08_bookings.sql
-- BOOKINGS (The Core Transaction)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number TEXT UNIQUE,
  customer_id UUID REFERENCES public.entities(id),
  agent_id UUID REFERENCES public.entities(id),
  status booking_status_type DEFAULT 'enquiry',
  service_type service_type_enum,
  origin_node_id UUID REFERENCES public.logistics_nodes(id),
  destination_node_id UUID REFERENCES public.logistics_nodes(id),
  scheduled_departure_date TIMESTAMPTZ,
  
  currency CHAR(3) DEFAULT 'AED',
  subtotal NUMERIC(12,2) DEFAULT 0.00,
  discount_amount NUMERIC(12,2) DEFAULT 0.00,
  tax_amount NUMERIC(12,2) DEFAULT 0.00,
  total_amount NUMERIC(12,2) DEFAULT 0.00,
  paid_amount NUMERIC(12,2) DEFAULT 0.00,
  balance_amount NUMERIC(12,2) DEFAULT 0.00,
  
  coordinator_id UUID REFERENCES public.profiles(id),
  internal_notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

DROP INDEX IF EXISTS idx_bookings_status;
CREATE INDEX idx_bookings_status ON bookings(status);

DROP INDEX IF EXISTS idx_bookings_customer;
CREATE INDEX idx_bookings_customer ON bookings(customer_id);

DROP TRIGGER IF EXISTS set_updated_at_bookings ON public.bookings;
CREATE TRIGGER set_updated_at_bookings
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INT;
BEGIN
    IF NEW.booking_number IS NULL THEN
        year_part := TO_CHAR(NOW(), 'YYYY');
        SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 9) AS INT)), 0) + 1
        INTO sequence_num FROM bookings WHERE booking_number LIKE 'PP-' || year_part || '-%';
        
        NEW.booking_number := 'PP-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_booking_number ON public.bookings;
CREATE TRIGGER set_booking_number
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Junctions
CREATE TABLE IF NOT EXISTS public.booking_pets (
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id),
  recorded_weight_kg NUMERIC(6,2),
  crate_type_required TEXT,
  volumetric_weight_kg NUMERIC(6,2),
  notes TEXT,
  PRIMARY KEY (booking_id, pet_id)
);

CREATE TABLE IF NOT EXISTS public.booking_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.service_catalog(id),
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
