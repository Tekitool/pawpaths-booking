-- ============================================================================
-- 18_add_mandatory_to_services.sql
-- Add is_mandatory column to service_catalog
-- ============================================================================

ALTER TABLE public.service_catalog 
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT false;
