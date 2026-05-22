-- Initial Supabase schema for C-PRO
-- This migration is intentionally scoped to the skill matrix / manpower foundation.

create extension if not exists "pgcrypto";

create table if not exists public.skill_levels (
  level int primary key,
  label varchar not null,
  description text
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  code varchar not null unique,
  name varchar not null,
  description text
);

create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  nik varchar not null unique,
  name varchar not null,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operator_skills (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int not null check (level between 1 and 4),
  assessed_at timestamptz,
  certified_until timestamptz,
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (operator_id, skill_id)
);

create table if not exists public.workstations (
  id uuid primary key default gen_random_uuid(),
  line_id uuid,
  name varchar not null,
  sequence int not null,
  minimum_skill int not null default 2 check (minimum_skill between 1 and 4),
  ideal_cycle_time numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workstation_skill_requirements (
  id uuid primary key default gen_random_uuid(),
  workstation_id uuid not null references public.workstations(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete set null,
  minimum_level int not null default 2 check (minimum_level between 1 and 4),
  required boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workstation_defaults (
  id uuid primary key default gen_random_uuid(),
  workstation_id uuid not null references public.workstations(id) on delete cascade,
  default_headcount int not null default 1 check (default_headcount > 0),
  default_role varchar not null default 'Operator',
  shift_type varchar,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workstation_id, shift_type)
);

create table if not exists public.manpower_assignments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid,
  workstation_id uuid not null references public.workstations(id) on delete cascade,
  operator_id uuid not null references public.operators(id) on delete cascade,
  role varchar not null default 'Operator',
  assigned_at timestamptz not null default now(),
  assigned_by uuid,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_operator_skills_operator_id on public.operator_skills(operator_id);
create index if not exists idx_operator_skills_skill_id on public.operator_skills(skill_id);
create index if not exists idx_workstation_skill_requirements_workstation_id on public.workstation_skill_requirements(workstation_id);
create index if not exists idx_workstation_defaults_workstation_id on public.workstation_defaults(workstation_id);
create index if not exists idx_manpower_assignments_workstation_id on public.manpower_assignments(workstation_id);
create index if not exists idx_manpower_assignments_operator_id on public.manpower_assignments(operator_id);

-- Update timestamp helper trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_skill_levels_updated_at on public.skill_levels;
drop trigger if exists trg_skills_updated_at on public.skills;
drop trigger if exists trg_operators_updated_at on public.operators;
drop trigger if exists trg_operator_skills_updated_at on public.operator_skills;
drop trigger if exists trg_workstations_updated_at on public.workstations;
drop trigger if exists trg_workstation_skill_requirements_updated_at on public.workstation_skill_requirements;
drop trigger if exists trg_workstation_defaults_updated_at on public.workstation_defaults;
drop trigger if exists trg_manpower_assignments_updated_at on public.manpower_assignments;

create trigger trg_skill_levels_updated_at
before update on public.skill_levels
for each row execute function public.set_updated_at();

create trigger trg_skills_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

create trigger trg_operators_updated_at
before update on public.operators
for each row execute function public.set_updated_at();

create trigger trg_operator_skills_updated_at
before update on public.operator_skills
for each row execute function public.set_updated_at();

create trigger trg_workstations_updated_at
before update on public.workstations
for each row execute function public.set_updated_at();

create trigger trg_workstation_skill_requirements_updated_at
before update on public.workstation_skill_requirements
for each row execute function public.set_updated_at();

create trigger trg_workstation_defaults_updated_at
before update on public.workstation_defaults
for each row execute function public.set_updated_at();

create trigger trg_manpower_assignments_updated_at
before update on public.manpower_assignments
for each row execute function public.set_updated_at();
