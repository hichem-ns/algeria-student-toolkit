-- AST V5 — Supabase setup
-- Run this in Supabase SQL Editor. Auth users are managed by Supabase Auth.
create table if not exists public.student_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_data enable row level security;
drop policy if exists "users can read own data" on public.student_data;
drop policy if exists "users can insert own data" on public.student_data;
drop policy if exists "users can update own data" on public.student_data;
create policy "users can read own data" on public.student_data for select using (auth.uid() = user_id);
create policy "users can insert own data" on public.student_data for insert with check (auth.uid() = user_id);
create policy "users can update own data" on public.student_data for update using (auth.uid() = user_id);

-- Optional production group/chat foundation.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  university text,
  major text,
  goal text,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles are readable" on public.profiles;
drop policy if exists "users manage own profile" on public.profiles;
create policy "profiles are readable" on public.profiles for select using (true);
create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.study_groups enable row level security;
create table if not exists public.group_members (
  group_id uuid references public.study_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key(group_id,user_id)
);
alter table public.group_members enable row level security;
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.study_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.group_messages enable row level security;

-- Basic member-based policies.
create policy if not exists "members can read groups" on public.study_groups for select using (owner_id = auth.uid() or exists(select 1 from public.group_members gm where gm.group_id=id and gm.user_id=auth.uid()));
create policy if not exists "owners can create groups" on public.study_groups for insert with check (owner_id=auth.uid());
create policy if not exists "members can read memberships" on public.group_members for select using (user_id=auth.uid() or exists(select 1 from public.group_members gm where gm.group_id=group_id and gm.user_id=auth.uid()));
create policy if not exists "users can join groups" on public.group_members for insert with check (user_id=auth.uid());
create policy if not exists "members can read messages" on public.group_messages for select using (exists(select 1 from public.group_members gm where gm.group_id=group_id and gm.user_id=auth.uid()));
create policy if not exists "members can send messages" on public.group_messages for insert with check (user_id=auth.uid() and exists(select 1 from public.group_members gm where gm.group_id=group_id and gm.user_id=auth.uid()));
