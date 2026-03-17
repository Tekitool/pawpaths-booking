-- Migration: Add 'staff' value to user_role_type enum
-- PostgreSQL enums can only be extended (never shrunk) without dropping the type.
-- ALTER TYPE ... ADD VALUE is safe to run on a live database.

ALTER TYPE user_role_type ADD VALUE IF NOT EXISTS 'staff' BEFORE 'customer';
