WITH species_map AS (
    SELECT id, name FROM public.species WHERE name = 'Dog'
),
new_breeds (name, species_name, is_brachycephalic, is_restricted) AS (
    VALUES
    ('Greyhound', 'Dog', false, false)
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
