create table if not exists public.coach_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default 'Coach',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  coach_id uuid not null references public.coach_profiles(id) on delete cascade,
  name text not null,
  email text not null unique check (email = lower(email)),
  goal text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.training_plans (
  id text primary key,
  coach_id uuid not null references public.coach_profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  data jsonb not null default '{"sessions":[]}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.client_plan_assignments (
  client_id text primary key references public.clients(id) on delete cascade,
  training_plan_id text not null references public.training_plans(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_plans (
  client_id text primary key references public.clients(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.client_schedules (
  client_id text primary key references public.clients(id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.client_goals (
  client_id text primary key references public.clients(id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.coach_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.training_plans enable row level security;
alter table public.client_plan_assignments enable row level security;
alter table public.nutrition_plans enable row level security;
alter table public.client_schedules enable row level security;
alter table public.client_goals enable row level security;

drop policy if exists coach_profile_self on public.coach_profiles;
create policy coach_profile_self on public.coach_profiles for select to authenticated using (id = auth.uid());

drop policy if exists coaches_manage_own_clients on public.clients;
create policy coaches_manage_own_clients on public.clients for all to authenticated using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists clients_read_own_profile on public.clients;
create policy clients_read_own_profile on public.clients for select to authenticated using (active and lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));

drop policy if exists coaches_manage_own_plans on public.training_plans;
create policy coaches_manage_own_plans on public.training_plans for all to authenticated using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists clients_read_assigned_plan on public.training_plans;
create policy clients_read_assigned_plan on public.training_plans for select to authenticated using (
  exists (
    select 1 from public.client_plan_assignments a
    join public.clients c on c.id = a.client_id
    where a.training_plan_id = training_plans.id and c.active and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email',''))
  )
);

drop policy if exists coaches_manage_assignments on public.client_plan_assignments;
create policy coaches_manage_assignments on public.client_plan_assignments for all to authenticated using (
  exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid())
) with check (
  exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid())
);
drop policy if exists clients_read_assignment on public.client_plan_assignments;
create policy clients_read_assignment on public.client_plan_assignments for select to authenticated using (
  exists (select 1 from public.clients c where c.id = client_id and c.active and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email','')))
);

drop policy if exists coaches_manage_nutrition on public.nutrition_plans;
create policy coaches_manage_nutrition on public.nutrition_plans for all to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid())) with check (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid()));
drop policy if exists clients_read_nutrition on public.nutrition_plans;
create policy clients_read_nutrition on public.nutrition_plans for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.active and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email',''))));

drop policy if exists coaches_manage_schedules on public.client_schedules;
create policy coaches_manage_schedules on public.client_schedules for all to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid())) with check (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid()));
drop policy if exists clients_read_schedules on public.client_schedules;
create policy clients_read_schedules on public.client_schedules for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.active and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email',''))));

drop policy if exists coaches_manage_goals on public.client_goals;
create policy coaches_manage_goals on public.client_goals for all to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid())) with check (exists (select 1 from public.clients c where c.id = client_id and c.coach_id = auth.uid()));
drop policy if exists clients_read_goals on public.client_goals;
create policy clients_read_goals on public.client_goals for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.active and lower(c.email) = lower(coalesce(auth.jwt() ->> 'email',''))));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
