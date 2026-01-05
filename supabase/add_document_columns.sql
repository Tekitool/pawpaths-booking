-- Add specific columns for document paths
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS passport_path TEXT,
ADD COLUMN IF NOT EXISTS vaccination_path TEXT,
ADD COLUMN IF NOT EXISTS rabies_path TEXT;
