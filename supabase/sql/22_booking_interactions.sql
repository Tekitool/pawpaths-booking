-- Migration: Create booking_interactions table
-- This table stores operational timeline notes for each booking.

create table if not exists booking_interactions (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references bookings(id) on delete cascade,
    author_id uuid references auth.users(id) on delete set null,
    action_type text not null,
    note_content text not null,
    is_internal boolean not null default true,
    created_at timestamptz not null default now()
);

-- Index for fast lookup by booking
create index if not exists idx_booking_interactions_booking_id on booking_interactions(booking_id);

-- Optional: index on created_at for ordering
create index if not exists idx_booking_interactions_created_at on booking_interactions(created_at desc);

-- Enable RLS
alter table booking_interactions enable row level security;

-- Policies
-- 1. Agents can view all interactions
create policy "Agents can view all interactions"
    on booking_interactions for select
    using ( auth.role() = 'authenticated' );

-- 2. Agents can insert interactions
create policy "Agents can insert interactions"
    on booking_interactions for insert
    with check ( auth.role() = 'authenticated' );

-- 3. Agents can update their own interactions (optional, but good for corrections)
create policy "Agents can update own interactions"
    on booking_interactions for update
    using ( auth.uid() = author_id );

