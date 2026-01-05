-- Add missing columns for file uploads to the bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS pet_photo_path TEXT,
ADD COLUMN IF NOT EXISTS documents_path TEXT,
ADD COLUMN IF NOT EXISTS enquiry_session_id UUID;

-- Optional: Add a comment
COMMENT ON COLUMN bookings.pet_photo_path IS 'Path to the pet photo in Supabase Storage (photos bucket)';
COMMENT ON COLUMN bookings.documents_path IS 'Path to the documents folder in Supabase Storage (documents bucket)';
