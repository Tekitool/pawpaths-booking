-- Function to get enum values
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS TABLE (value text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT e.enumlabel::text
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = enum_name
    ORDER BY e.enumsortorder;
END;
$$;
