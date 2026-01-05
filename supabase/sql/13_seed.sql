-- ============================================================================
-- 13_seed.sql
-- SEED DATA
-- ============================================================================

-- Seed Species
INSERT INTO species (name, iata_code) VALUES 
('Dog', 'DOG'), 
('Cat', 'CAT'), 
('Bird', 'AVI')
ON CONFLICT (name) DO NOTHING;

-- Seed Countries (Sample)
INSERT INTO countries (id, iso_code, iso_code_3, name, timezone) VALUES
(784, 'AE', 'ARE', 'United Arab Emirates', 'Asia/Dubai'),
(826, 'GB', 'GBR', 'United Kingdom', 'Europe/London'),
(840, 'US', 'USA', 'United States', 'America/New_York')
ON CONFLICT (id) DO NOTHING;

-- Seed Logistics Nodes (Sample)
INSERT INTO logistics_nodes (node_type, name, iata_code, country_id, coordinates) VALUES
('airport', 'Dubai International (DXB)', 'DXB', 784, ST_SetSRID(ST_MakePoint(55.3644, 25.2532), 4326)),
('airport', 'London Heathrow (LHR)', 'LHR', 826, ST_SetSRID(ST_MakePoint(-0.4543, 51.4700), 4326));

-- Seed Service Categories
INSERT INTO service_categories (name) VALUES 
('Transport'), 
('Documentation'), 
('Veterinary')
ON CONFLICT (name) DO NOTHING;
