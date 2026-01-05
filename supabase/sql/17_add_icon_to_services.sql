-- ============================================================================
-- 17_add_icon_to_services.sql
-- Add icon column to service_catalog
-- ============================================================================

ALTER TABLE public.service_catalog 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Box';
