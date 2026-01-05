-- ============================================================================
-- 16_seed_services_logic.sql
-- Seed Service Catalog with Applicability Tags AND Mandatory Flags
-- ============================================================================

-- 1. Ensure Categories Exist
INSERT INTO service_categories (name, display_order) VALUES 
('Transport', 10), 
('Documentation', 20), 
('Veterinary', 30),
('Logistics', 40),
('Boarding', 50)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Services with Applicability Tags & Mandatory Flags
-- Tags: EXP, IMP, LOCL, TRANSIT
-- Modes: manifest_cargo, in_cabin, excess_baggage, ground_transport, private_charter

INSERT INTO public.service_catalog (code, category_id, name, base_price, applicability, pricing_model, icon, is_mandatory)
VALUES 
    -- EXPORT SERVICES
    ('EXP-001', (SELECT id FROM service_categories WHERE name = 'Documentation'), 'Export Health Certificate (UAE)', 500.00, ARRAY['EXP', 'manifest_cargo', 'in_cabin', 'excess_baggage', 'private_charter'], 'fixed', 'FileText', true),
    ('EXP-002', (SELECT id FROM service_categories WHERE name = 'Transport'), 'Flight Booking (Manifest Cargo)', 250.00, ARRAY['EXP', 'manifest_cargo'], 'fixed', 'Plane', true),
    ('EXP-003', (SELECT id FROM service_categories WHERE name = 'Logistics'), 'Airport Drop-off (DXB/DWC)', 350.00, ARRAY['EXP', 'manifest_cargo', 'excess_baggage'], 'fixed', 'Truck', false),
    ('EXP-004', (SELECT id FROM service_categories WHERE name = 'Veterinary'), 'Pre-flight Veterinary Check', 200.00, ARRAY['EXP', 'manifest_cargo', 'in_cabin', 'excess_baggage'], 'fixed', 'Stethoscope', true),
    ('EXP-005', (SELECT id FROM service_categories WHERE name = 'Transport'), 'Flight Booking Assistance (In Cabin)', 150.00, ARRAY['EXP', 'in_cabin'], 'fixed', 'User', false),

    -- IMPORT SERVICES
    ('IMP-001', (SELECT id FROM service_categories WHERE name = 'Documentation'), 'Import Permit (UAE)', 600.00, ARRAY['IMP', 'manifest_cargo', 'in_cabin', 'excess_baggage', 'private_charter'], 'fixed', 'FileText', true),
    ('IMP-002', (SELECT id FROM service_categories WHERE name = 'Logistics'), 'Customs Clearance (Arrival)', 850.00, ARRAY['IMP', 'manifest_cargo'], 'fixed', 'CheckCircle', true),
    ('IMP-003', (SELECT id FROM service_categories WHERE name = 'Logistics'), 'Airport Pick-up & Delivery', 450.00, ARRAY['IMP', 'manifest_cargo', 'excess_baggage'], 'fixed', 'Truck', false),
    ('IMP-004', (SELECT id FROM service_categories WHERE name = 'Veterinary'), 'Post-Arrival Vet Inspection', 300.00, ARRAY['IMP', 'manifest_cargo', 'in_cabin', 'excess_baggage'], 'fixed', 'Stethoscope', true),

    -- LOCAL MOVE (Ground Transport)
    ('LOC-001', (SELECT id FROM service_categories WHERE name = 'Transport'), 'Pet Taxi (Dubai City Limits)', 150.00, ARRAY['LOCL', 'ground_transport'], 'fixed', 'Car', false),
    ('LOC-002', (SELECT id FROM service_categories WHERE name = 'Transport'), 'Pet Taxi (Inter-Emirate)', 450.00, ARRAY['LOCL', 'ground_transport'], 'fixed', 'Car', false),
    ('LOC-003', (SELECT id FROM service_categories WHERE name = 'Boarding'), 'Day Care (During Move)', 100.00, ARRAY['LOCL', 'ground_transport'], 'fixed', 'Home', false),

    -- UNIVERSAL / OPTIONAL
    ('GEN-001', (SELECT id FROM service_categories WHERE name = 'Logistics'), 'Travel Crate (IATA Approved)', 400.00, ARRAY['EXP', 'IMP', 'LOCL', 'manifest_cargo', 'excess_baggage'], 'fixed', 'Box', false),
    ('GEN-002', (SELECT id FROM service_categories WHERE name = 'Boarding'), 'Overnight Boarding', 150.00, ARRAY['EXP', 'IMP', 'LOCL', 'TRANSIT'], 'fixed', 'Home', false)

ON CONFLICT (code) DO UPDATE SET
    applicability = EXCLUDED.applicability,
    base_price = EXCLUDED.base_price,
    category_id = EXCLUDED.category_id,
    icon = EXCLUDED.icon,
    is_mandatory = EXCLUDED.is_mandatory;
