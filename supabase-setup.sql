create table public.backlog_items (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  description text default '',
  notes text default '',
  link text default '',
  image text,
  tags text[] default '{}',
  priority text not null,
  status text not null,
  favorite boolean default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  due_date timestamptz,
  progress integer default 0,
  fields jsonb default '{}'::jsonb
);

alter table public.backlog_items enable row level security;

create policy "Users can view their own items"
  on public.backlog_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on public.backlog_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.backlog_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.backlog_items for delete
  using (auth.uid() = user_id);
