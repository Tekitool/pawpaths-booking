-- ============================================================================
-- 21_audit_logs.sql
-- SYSTEM AUDIT LOGS (Security Ledger)
-- ============================================================================

-- Create Enum for Action Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_type') THEN
        CREATE TYPE audit_action_type AS ENUM ('UPDATE', 'DELETE', 'CREATE', 'LOGIN');
    END IF;
END$$;

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action_type audit_action_type NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason_note TEXT NOT NULL, -- Mandatory Reason
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON system_audit_logs(entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON system_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON system_audit_logs(created_at);

-- RLS Policies
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view logs
CREATE POLICY "Admins can view audit logs"
  ON public.system_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- System can insert logs (Service Role) or Authenticated Users via Server Actions
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.system_audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
