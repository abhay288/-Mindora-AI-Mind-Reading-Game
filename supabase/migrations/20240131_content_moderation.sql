-- Create character_images table
create table if not exists character_images (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  image_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  uploaded_by uuid, -- Can be null if anon, or reference auth.users if we had auth
  created_at timestamp with time zone default now()
);

-- Create moderation_logs table
create table if not exists moderation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid, -- Reference to admin user
  action text not null, -- 'approve_image', 'reject_image', 'delete_entity'
  target_id uuid not null,
  reason text,
  created_at timestamp with time zone default now()
);

-- Add columns to entities for better data & moderation
alter table entities 
add column if not exists description text,
add column if not exists category text,
add column if not exists is_public_figure boolean default true,
add column if not exists status text default 'active' check (status in ('active', 'pending_review', 'rejected'));

-- RLS Policies (Assumed public for now for game, strict for writes)
-- Note: Real production apps need strict RLS. For this prototype, we rely on API logic.
