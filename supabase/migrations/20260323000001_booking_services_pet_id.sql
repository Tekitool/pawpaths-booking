-- Add pet_id to booking_services so per-pet service associations are preserved
ALTER TABLE public.booking_services
  ADD COLUMN IF NOT EXISTS pet_id UUID REFERENCES public.pets(id);

CREATE INDEX IF NOT EXISTS idx_booking_services_pet
  ON public.booking_services(pet_id);
