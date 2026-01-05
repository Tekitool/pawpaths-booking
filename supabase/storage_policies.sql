-- ==========================================
-- Supabase Storage RLS Policies
-- Strategy: Hybrid Public/Private Access
-- ==========================================

-- 1. Enable RLS on storage.objects (Standard Practice)
-- NOTE: RLS is enabled by default on Supabase Storage. 
-- We skip the explicit enable command to avoid "must be owner" errors.
-- alter table storage.objects enable row level security;

-- ==========================================
-- PUBLIC BUCKETS (Anonymous Uploads Allowed)
-- ==========================================

-- Policy: Allow ANYONE to upload to 'photos' (Pet Photos)
create policy "Public Uploads to Photos"
on storage.objects for insert
with check ( bucket_id = 'photos' );

-- Policy: Allow ANYONE to upload to 'documents' (Pet Docs/Passports)
-- Note: While upload is public, viewing should be restricted via SELECT policies later.
create policy "Public Uploads to Documents"
on storage.objects for insert
with check ( bucket_id = 'documents' );

-- Policy: Allow ANYONE to VIEW files in 'photos' (Publicly accessible)
create policy "Public View Photos"
on storage.objects for select
using ( bucket_id = 'photos' );

-- ==========================================
-- PROTECTED BUCKETS (Authenticated Only)
-- ==========================================

-- Policy: Allow ONLY Authenticated Users to upload to 'avatars' (Brand Assets)
create policy "Authenticated Uploads to Avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

-- Policy: Allow ONLY Authenticated Users to upload to 'media' (Profile Photos)
create policy "Authenticated Uploads to Media"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'media' );

-- Policy: Allow ANYONE to VIEW 'avatars' and 'media' (Since they are public assets)
create policy "Public View Avatars and Media"
on storage.objects for select
using ( bucket_id in ('avatars', 'media') );

-- ==========================================
-- PRIVATE DOCUMENTS SECURITY
-- ==========================================

-- Policy: Restrict VIEWING of 'documents' to Authenticated Users (Admins/Owners)
-- This ensures random public users cannot download passports even if they guess the URL.
create policy "Authenticated View Documents"
on storage.objects for select
to authenticated
using ( bucket_id = 'documents' );
