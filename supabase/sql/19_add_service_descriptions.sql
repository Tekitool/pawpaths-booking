-- ============================================================================
-- 19_add_service_descriptions.sql
-- Add description and requirements columns to service_catalog
-- ============================================================================

ALTER TABLE public.service_catalog
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT;
