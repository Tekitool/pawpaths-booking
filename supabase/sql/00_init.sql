-- ============================================================================
-- 00_init.sql
-- CONFIGURATION & EXTENSIONS
-- ============================================================================

-- Set Timezone to UTC
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for Geography/Location features
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable Full Text Search and Indexing optimizations
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Verify Extensions
SELECT * FROM pg_extension;
