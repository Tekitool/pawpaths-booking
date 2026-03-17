-- Migration: Fix handle_new_user trigger to handle all unique constraint violations
-- Issue: ON CONFLICT (id) only covers the PK; retrying with the same email
--        hits the email UNIQUE constraint and raises an unhandled exception.
-- Fix:   ON CONFLICT DO NOTHING handles both id PK and email UNIQUE violations.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
