-- Data Migration: Populate Breeds and Species
-- This script assumes the tables public.species and public.breeds already exist.

-- 1. Ensure basic species exist
INSERT INTO public.species (name) VALUES ('Dog'), ('Cat')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert/Update Breeds Data with Snub-nosed (Brachycephalic) flags
WITH species_map AS (
    SELECT id, name FROM public.species WHERE name IN ('Dog', 'Cat')
),
new_breeds (name, species_name, is_brachycephalic, is_restricted) AS (
    VALUES
    -- DOGS - Snub Nosed (High Risk)
    ('French Bulldog', 'Dog', true, true),
    ('English Bulldog', 'Dog', true, true),
    ('Pug', 'Dog', true, true),
    ('Bullmastiff', 'Dog', true, true),
    ('Cane Corso', 'Dog', true, true),
    ('Dogue de Bordeaux', 'Dog', true, true),
    
    -- DOGS - Snub Nosed (Moderate Risk)
    ('Boston Terrier', 'Dog', true, false),
    ('Boxer', 'Dog', true, false),
    ('Shih Tzu', 'Dog', true, false),
    ('Pekingese', 'Dog', true, false),
    ('Japanese Chin', 'Dog', true, false),
    ('Lhasa Apso', 'Dog', true, false),
    
    -- DOGS - Standard
    ('Golden Retriever', 'Dog', false, false),
    ('Labrador Retriever', 'Dog', false, false),
    ('German Shepherd', 'Dog', false, false),
    ('Poodle (Standard)', 'Dog', false, false),
    ('Poodle (Miniature)', 'Dog', false, false),
    ('Beagle', 'Dog', false, false),
    ('Rottweiler', 'Dog', false, true),
    ('Siberian Husky', 'Dog', false, true),
    ('Doberman Pinscher', 'Dog', false, true),
    ('Great Dane', 'Dog', false, true),
    ('Chihuahua', 'Dog', false, false),
    ('Yorkshire Terrier', 'Dog', false, false),
    ('Dachshund', 'Dog', false, false),
    ('Border Collie', 'Dog', false, false),
    ('Australian Shepherd', 'Dog', false, false),
    ('Cocker Spaniel', 'Dog', false, false),
    
    -- CATS - Snub Nosed (High Risk)
    ('Persian', 'Cat', true, true),
    ('Exotic Shorthair', 'Cat', true, true),
    ('Himalayan', 'Cat', true, true),
    
    -- CATS - Snub Nosed (Moderate Risk)
    ('Scottish Fold', 'Cat', true, false),
    ('British Shorthair', 'Cat', true, false),
    ('Burmese', 'Cat', true, false),
    
    -- CATS - Standard
    ('Siamese', 'Cat', false, false),
    ('Maine Coon', 'Cat', false, false),
    ('Ragdoll', 'Cat', false, false),
    ('Bengal', 'Cat', false, false),
    ('Sphynx', 'Cat', false, false),
    ('Abyssinian', 'Cat', false, false),
    ('Domestic Shorthair', 'Cat', false, false)
)
INSERT INTO public.breeds (name, species_id, is_brachycephalic, is_restricted)
SELECT 
    nb.name, 
    sm.id, 
    nb.is_brachycephalic, 
    nb.is_restricted
FROM new_breeds nb
JOIN species_map sm ON nb.species_name = sm.name
ON CONFLICT (species_id, name) 
DO UPDATE SET 
    is_brachycephalic = EXCLUDED.is_brachycephalic,
    is_restricted = EXCLUDED.is_restricted;
