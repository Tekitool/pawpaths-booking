-- Enable RLS on service_catalog (Critical Security Fix)
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

-- Policies for service_catalog
CREATE POLICY "Public Read Access" ON service_catalog FOR SELECT USING (true);

-- Only staff can modify services
CREATE POLICY "Staff Manage Access" ON service_catalog FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance')
  )
);

-- Add missing columns to bookings to match Mongoose schema
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS origin_raw JSONB,
ADD COLUMN IF NOT EXISTS destination_raw JSONB,
ADD COLUMN IF NOT EXISTS transport_mode TEXT,
ADD COLUMN IF NOT EXISTS number_of_pets INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS traveling_with_pet BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_contact_snapshot JSONB;

-- Add RLS for public booking creation (if needed) or rely on Service Role
-- Since we use Service Role for the booking API, we don't strictly need an INSERT policy for public users on bookings table,
-- but it's good practice to have one if we ever switch to client-side submission.
-- For now, we'll rely on the API route using Service Role.
