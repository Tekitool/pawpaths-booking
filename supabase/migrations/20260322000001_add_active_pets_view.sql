-- View: active_pets
-- Returns only pets that have not been soft-deleted.
-- Provides a clean abstraction for any future query that needs
-- only active pets, avoiding repeated is_active/deleted_at filters.

CREATE OR REPLACE VIEW active_pets AS
SELECT *
FROM   pets
WHERE  is_active  = TRUE
AND    deleted_at IS NULL;
