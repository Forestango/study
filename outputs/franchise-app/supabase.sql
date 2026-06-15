create table if not exists public.franchise_content (
  id text primary key,
  articles jsonb not null default '[]'::jsonb,
  images jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.franchise_content enable row level security;

drop policy if exists "franchise_content_public_read" on public.franchise_content;
create policy "franchise_content_public_read"
on public.franchise_content
for select
using (id = 'default');

drop policy if exists "franchise_content_public_insert" on public.franchise_content;
create policy "franchise_content_public_insert"
on public.franchise_content
for insert
with check (id = 'default');

drop policy if exists "franchise_content_public_update" on public.franchise_content;
create policy "franchise_content_public_update"
on public.franchise_content
for update
using (id = 'default')
with check (id = 'default');

create or replace function public.touch_franchise_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_franchise_content_updated_at on public.franchise_content;
create trigger touch_franchise_content_updated_at
before update on public.franchise_content
for each row
execute function public.touch_franchise_content_updated_at();
