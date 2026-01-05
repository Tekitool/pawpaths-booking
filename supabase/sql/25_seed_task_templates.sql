-- 25_seed_task_templates.sql
-- Initial seed for 15 Standard Operational Tasks

INSERT INTO public.task_templates (title, description, priority, service_scope, anchor_event, days_offset) VALUES
-- Phase 1: Preparation (-30 to -14 days)
('Initial Vet Consult & Vaccinations', 'Check microchip, rabies validity, and schedule boosters if needed.', 'high', '{"export", "import"}', 'scheduled_departure', -30),
('Check Import Requirements', 'Verify destination country entry requirements and breed restrictions.', 'high', '{"export"}', 'scheduled_departure', -28),
('Order Travel Crate', 'Measure pet and order IATA compliant travel crate.', 'medium', '{"export", "domestic"}', 'scheduled_departure', -21),
('Crate Training Advice', 'Send crate training guide to customer.', 'low', '{"export"}', 'scheduled_departure', -20),
('Book Flight Cargo', 'Request space confirmation with airline.', 'high', '{"export"}', 'scheduled_departure', -14),

-- Phase 2: Documentation (-14 to -7 days)
('Apply for Import Permit', 'Submit application to destination country ministry/authority.', 'high', '{"export"}', 'scheduled_departure', -10),
('Draft Health Certificate', 'Prepare draft government health certificate for review.', 'medium', '{"export"}', 'scheduled_departure', -7),
('Request Flight Confirmation', 'Ensure airway bill (AWB) is issued.', 'high', '{"export"}', 'scheduled_departure', -7),
('Collect Original Docs', 'Collect vaccination book and passport from owner.', 'medium', '{"export"}', 'scheduled_departure', -5),

-- Phase 3: Pre-Flight (-5 to -1 days)
('Final Vet Check', 'Clinical exam for health certificate endorsement.', 'high', '{"export"}', 'scheduled_departure', -2),
('Ministry Endorsement', 'Get official stamp on health certificate from government vet.', 'high', '{"export"}', 'scheduled_departure', -1),
('Prepare Travel Pouch', 'Assemble original docs, AWB, and copies attached to crate.', 'medium', '{"export"}', 'scheduled_departure', -1),

-- Phase 4: Departure & Arrival (Day 0 to +1)
('Airport Check-In', 'Lodge pet at cargo terminal.', 'high', '{"export"}', 'scheduled_departure', 0),
('Send Pre-Alert', 'Email flight details and copies of docs to destination agent/owner.', 'high', '{"export"}', 'scheduled_departure', 0),
('Arrival Clearance', 'Clear customs and vet inspection at destination.', 'high', '{"import"}', 'scheduled_arrival', 0);

