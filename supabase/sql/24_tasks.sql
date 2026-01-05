-- Create task_status enum
create type task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');

-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid not null references bookings(id) on delete cascade,
  template_id uuid references task_templates(id), -- Optional link to source
  title text not null,
  description text,
  status task_status not null default 'pending',
  priority text default 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  assigned_to uuid references profiles(id), -- Assigned to an internal user (profile)
  created_at timestamptz default now()
);

-- Index for faster lookups
create index idx_tasks_booking_id on tasks(booking_id);
create index idx_tasks_status on tasks(status);
