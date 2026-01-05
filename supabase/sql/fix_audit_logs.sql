-- Idempotent Audit Logs Setup

-- 1. Create Enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_type') THEN
        CREATE TYPE audit_action_type AS ENUM ('UPDATE', 'DELETE', 'CREATE', 'LOGIN');
    END IF;
END$$;

-- 2. Create Table if not exists
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action_type audit_action_type NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason_note TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes if not exists
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON system_audit_logs(entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON system_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON system_audit_logs(created_at);

-- 4. Enable RLS
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts and recreate them
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.system_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.system_audit_logs;

-- 6. Recreate Policies
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

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.system_audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
