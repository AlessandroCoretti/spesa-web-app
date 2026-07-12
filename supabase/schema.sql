-- Your Lists — Supabase schema, RLS policies, and invite RPC.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

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

create table if not exists invites (
  code text primary key default substr(md5(random()::text), 1, 8),
  list_id uuid not null references lists(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  max_uses integer,
  use_count integer not null default 0
);

-- ============================================================
-- updated_at trigger (server-side clock, used for last-write-wins)
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lists_updated_at on lists;
create trigger trg_lists_updated_at before update on lists
  for each row execute function set_updated_at();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();

drop trigger if exists trg_items_updated_at on items;
create trigger trg_items_updated_at before update on items
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

-- profiles: read/update only your own row
create policy "own profile read" on profiles for select using (id = auth.uid());
create policy "own profile update" on profiles for update using (id = auth.uid());

-- lists: member read; owner insert/update/delete
create policy "member read lists" on lists for select
  using (exists (select 1 from list_members m where m.list_id = lists.id and m.user_id = auth.uid()));
create policy "owner insert list" on lists for insert
  with check (owner_id = auth.uid());
create policy "owner update list" on lists for update
  using (owner_id = auth.uid());
create policy "owner delete list" on lists for delete
  using (owner_id = auth.uid());

-- list_members: members can read the membership of lists they belong to.
-- No insert/update/delete policy for regular clients: the only way to join
-- is the accept_invite() function below (security definer).
create policy "member read members" on list_members for select
  using (exists (select 1 from list_members m2 where m2.list_id = list_members.list_id and m2.user_id = auth.uid()));

-- categories / items: full read+write for list members
create policy "member rw categories" on categories for all
  using (exists (select 1 from list_members m where m.list_id = categories.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = categories.list_id and m.user_id = auth.uid()));

create policy "member rw items" on items for all
  using (exists (select 1 from list_members m where m.list_id = items.list_id and m.user_id = auth.uid()))
  with check (exists (select 1 from list_members m where m.list_id = items.list_id and m.user_id = auth.uid()));

-- invites: any authenticated user can look up an invite by code (needed to
-- resolve /join/:code); only members of a list can create invites for it.
create policy "authenticated read invite" on invites for select
  using (auth.role() = 'authenticated');
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
-- Realtime: make sure the tables broadcast changes
-- ============================================================

alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table items;
