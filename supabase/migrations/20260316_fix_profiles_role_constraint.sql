-- ============================================================
-- Migration: Expand profiles.role CHECK constraint
-- Issue: The constraint only allowed 4 values (admin, super_admin, staff, viewer)
--        but the app now has 8 roles. The handle_new_user() trigger defaults to
--        'customer' which violated the constraint, causing:
--        "[Auth] Database error saving new user"
-- Fix:   Drop the old constraint and add a new one matching all 8 app roles.
--        Also update the trigger default from 'staff' to 'customer' to match
--        the application's default role for new sign-ups.
-- ============================================================

-- 1. Drop the existing restrictive CHECK constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add the expanded constraint matching lib/constants/roles.ts
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'super_admin',
    'admin',
    'ops_manager',
    'relocation_coordinator',
    'finance',
    'driver',
    'staff',
    'customer'
  ));

-- 3. Update the default column value to 'customer' (was 'staff')
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'customer';

-- 4. Recreate the trigger function with the correct default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'customer'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
