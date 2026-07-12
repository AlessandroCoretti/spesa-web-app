-- Your Lists — Supabase schema, RLS policies, and invite RPC.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- ============================================================
-- updated_at trigger function (defined first: tables below reference it)
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists lists (
  id uuid primary key,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null default 'home',
  color text not null default 'blush',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists list_members (
  list_id uuid not null references lists(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

create table if not exists categories (
  id uuid primary key,
  list_id uuid not null references lists(id) on delete cascade,
  name text not null,
  color text not null default 'blush',
  icon text not null default 'tag',
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key,
  list_id uuid not null references lists(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  status text not null check (status in ('da_comprare', 'esaurito', 'meta_scorta', 'in_casa')),
  note text not null default '',
  quantity numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fase 0: campi per statistiche, previsioni consumi e note segrete.
alter table items add column if not exists created_by uuid references profiles(id);
alter table items add column if not exists stockout_history jsonb not null default '[]'::jsonb;
alter table items add column if not exists secret_note text;
alter table items add column if not exists secret_note_author_id uuid references profiles(id);

-- Cartelle stile Android (drag-and-drop di un item su un altro) e ordinamento manuale.
create table if not exists folders (
  id uuid primary key,
  list_id uuid not null references lists(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  name text not null default 'Nuova cartella',
  "order" numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table items add column if not exists folder_id uuid references folders(id) on delete set null;
alter table items add column if not exists "order" numeric not null default 0;

create table if not exists invites (
  code text primary key default substr(md5(random()::text), 1, 8),
  list_id uuid not null references lists(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  max_uses integer,
  use_count integer not null default 0
);

-- Fase 4: budget condiviso con split personalizzato per spesa.
create table if not exists expenses (
  id uuid primary key,
  list_id uuid not null references lists(id) on delete cascade,
  description text not null,
  amount numeric not null,
  paid_by uuid not null references profiles(id),
  expense_date timestamptz not null default now(),
  splits jsonb not null default '[]'::jsonb,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- updated_at triggers (all tables exist by this point)
-- ============================================================

drop trigger if exists trg_lists_updated_at on lists;
create trigger trg_lists_updated_at before update on lists
  for each row execute function set_updated_at();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();

drop trigger if exists trg_items_updated_at on items;
create trigger trg_items_updated_at before update on items
  for each row execute function set_updated_at();

drop trigger if exists trg_folders_updated_at on folders;
create trigger trg_folders_updated_at before update on folders
  for each row execute function set_updated_at();

drop trigger if exists trg_expenses_updated_at on expenses;
create trigger trg_expenses_updated_at before update on expenses
  for each row execute function set_updated_at();

-- ============================================================
-- profiles auto-provisioning on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table lists enable row level security;
alter table list_members enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table invites enable row level security;
alter table expenses enable row level security;
alter table folders enable row level security;

-- profiles: read/update only your own row
drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select using (id = auth.uid());
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (id = auth.uid());

-- lists: member read; owner insert/update/delete
drop policy if exists "member read lists" on lists;
create policy "member read lists" on lists for select
  using (exists (select 1 from list_members m where m.list_id = lists.id and m.user_id = auth.uid()));
drop policy if exists "owner insert list" on lists;
create policy "owner insert list" on lists for insert
  with check (owner_id = auth.uid());
drop policy if exists "owner update list" on lists;
create policy "owner update list" on lists for update
  using (owner_id = auth.uid());
drop policy if exists "owner delete list" on lists;
create policy "owner delete list" on lists for delete
  using (owner_id = auth.uid());

-- list_members: members can read the membership of lists they belong to.
-- No insert/update/delete policy for regular clients: the only way to join
-- is the accept_invite() function below (security definer).
drop policy if exists "member read members" on list_members;
create policy "member read members" on list_members for select
  using (exists (select 1 from list_members m2 where m2.list_id = list_members.list_id and m2.user_id = auth.uid()));

-- categories / items: full read+write for list members
drop policy if exists "member rw categories" on categories;
create policy "member rw categories" on categories for all
  using (exists (select 1 from list_members m where m.list_id = categories.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = categories.list_id and m.user_id = auth.uid()));

drop policy if exists "member rw items" on items;
create policy "member rw items" on items for all
  using (exists (select 1 from list_members m where m.list_id = items.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = items.list_id and m.user_id = auth.uid()));

drop policy if exists "member rw expenses" on expenses;
create policy "member rw expenses" on expenses for all
  using (exists (select 1 from list_members m where m.list_id = expenses.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = expenses.list_id and m.user_id = auth.uid()));

drop policy if exists "member rw folders" on folders;
create policy "member rw folders" on folders for all
  using (exists (select 1 from list_members m where m.list_id = folders.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = folders.list_id and m.user_id = auth.uid()));

-- invites: any authenticated user can look up an invite by code (needed to
-- resolve /join/:code); only members of a list can create invites for it.
drop policy if exists "authenticated read invite" on invites;
create policy "authenticated read invite" on invites for select
  using (auth.role() = 'authenticated');
drop policy if exists "member create invite" on invites;
create policy "member create invite" on invites for insert
  with check (exists (select 1 from list_members m where m.list_id = invites.list_id and m.user_id = auth.uid()));

-- ============================================================
-- accept_invite RPC: the only way a client can insert into list_members.
-- security definer bypasses the lack of an insert policy on list_members,
-- but only after validating the invite code, expiry, and use count.
-- ============================================================

create or replace function accept_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_list_id uuid;
  v_expires timestamptz;
  v_max integer;
  v_uses integer;
begin
  select list_id, expires_at, max_uses, use_count
    into v_list_id, v_expires, v_max, v_uses
    from invites where code = invite_code
    for update;

  if v_list_id is null then
    raise exception 'invite_not_found';
  end if;
  if v_expires < now() then
    raise exception 'invite_expired';
  end if;
  if v_max is not null and v_uses >= v_max then
    raise exception 'invite_exhausted';
  end if;

  insert into list_members (list_id, user_id, role)
  values (v_list_id, auth.uid(), 'member')
  on conflict (list_id, user_id) do nothing;

  update invites set use_count = use_count + 1 where code = invite_code;

  return v_list_id;
end;
$$;

grant execute on function accept_invite(text) to authenticated;

-- ============================================================
-- delete_own_account RPC: lets a signed-in user delete their own account.
-- Deleting the auth.users row cascades through profiles -> lists (owned
-- lists) -> categories/items/list_members, and out of any other lists'
-- list_members rows, thanks to the "on delete cascade" foreign keys above.
-- ============================================================

create or replace function delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function delete_own_account() to authenticated;

-- ============================================================
-- Realtime: make sure the tables broadcast changes
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'lists'
  ) then
    alter publication supabase_realtime add table lists;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'categories'
  ) then
    alter publication supabase_realtime add table categories;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'items'
  ) then
    alter publication supabase_realtime add table items;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'expenses'
  ) then
    alter publication supabase_realtime add table expenses;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'folders'
  ) then
    alter publication supabase_realtime add table folders;
  end if;
end $$;
