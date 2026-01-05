-- Create enum for task anchor events
create type task_anchor_event as enum ('booking_confirmed', 'scheduled_departure', 'scheduled_arrival');

-- Create task_templates table
create table task_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  
  -- LOGIC RULES --
  -- Which services does this apply to? e.g., ['export', 'import']
  service_scope text[] not null default '{"export", "import", "local", "domestic", "transit"}',
  
  -- TIMING RULES (Monday.com Style Date Math) --
  -- What date do we calculate from?
  anchor_event task_anchor_event not null default 'scheduled_departure',
  -- How many days before/after anchor? e.g., -5 is "5 days before departure"
  days_offset integer not null default 0,
  
  is_active boolean default true,
  created_at timestamptz default now()
);
