-- ============================================================================
-- 12_rls.sql
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_documents ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance')
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- POLICIES
-- ============================================================================

-- PROFILES
CREATE POLICY "Users view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id OR is_staff());

CREATE POLICY "Users update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- ENTITIES
CREATE POLICY "Users view own entities" 
ON entities FOR SELECT 
USING (profile_id = auth.uid() OR is_staff());

CREATE POLICY "Staff manage all entities" 
ON entities FOR ALL 
USING (is_staff());

-- BOOKINGS
CREATE POLICY "Users view own bookings" 
ON bookings FOR SELECT 
USING (
    customer_id IN (SELECT id FROM entities WHERE profile_id = auth.uid()) 
    OR is_staff()
);

CREATE POLICY "Staff manage all bookings" 
ON bookings FOR ALL 
USING (is_staff());

-- PETS
CREATE POLICY "Users view own pets" 
ON pets FOR SELECT 
USING (
    owner_id IN (SELECT id FROM entities WHERE profile_id = auth.uid()) 
    OR is_staff()
);

CREATE POLICY "Staff manage all pets" 
ON pets FOR ALL 
USING (is_staff());

-- FINANCE
CREATE POLICY "Users view own finance docs" 
ON finance_documents FOR SELECT 
USING (
    entity_id IN (SELECT id FROM entities WHERE profile_id = auth.uid()) 
    OR is_staff()
);

CREATE POLICY "Staff manage finance" 
ON finance_documents FOR ALL 
USING (is_staff());
