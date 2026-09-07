-- Google-authenticated users. Role is stored here (not in user_metadata)
-- so RLS and routing never trust a client-editable JWT claim.

create type public.app_role as enum ('customer', 'shopkeeper');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  display_name text not null default '',
  email text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per Google account. Role is fixed after first insert.';

create table public.khata_states (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.khata_states is 'Per-user khata snapshot used by the live customer/shopkeeper app.';

alter table public.profiles enable row level security;
alter table public.khata_states enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own_without_role_change"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select existing.role from public.profiles as existing where existing.id = auth.uid())
  );

create policy "khata_states_select_own"
  on public.khata_states for select to authenticated
  using (user_id = auth.uid());

create policy "khata_states_insert_own"
  on public.khata_states for insert to authenticated
  with check (user_id = auth.uid());

create policy "khata_states_update_own"
  on public.khata_states for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger khata_states_touch_updated_at
  before update on public.khata_states
  for each row execute function public.touch_updated_at();
