-- Create a table to store system flows
create table public.flows (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  description text,
  data jsonb not null, -- Stores the blocks and connections block
  is_public boolean default false
);

-- Enable Row Level Security (RLS)
alter table public.flows enable row level security;

-- Create policies (simplified for demo purposes - allow public read/write for now)
-- In production, you would restrict this to authenticated users
create policy "Enable read access for all users" on public.flows
  for select using (true);

create policy "Enable insert access for all users" on public.flows
  for insert with check (true);

create policy "Enable update access for all users" on public.flows
  for update using (true);
