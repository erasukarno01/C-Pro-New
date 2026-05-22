-- Training, assessment, and audit log schema for skill development workflow

create table if not exists public.operator_training_sessions (
  id uuid primary key default gen_random_uuid(),
  training_code varchar not null unique,
  operator_id uuid not null references public.operators(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  trainer_name varchar not null,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status varchar not null default 'planned' check (status in ('planned', 'scheduled', 'ongoing', 'completed', 'cancelled')),
  location varchar,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operator_skill_assessments (
  id uuid primary key default gen_random_uuid(),
  training_session_id uuid references public.operator_training_sessions(id) on delete set null,
  operator_id uuid not null references public.operators(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  previous_level int check (previous_level between 1 and 4),
  assessed_level int not null check (assessed_level between 1 and 4),
  status varchar not null default 'draft' check (status in ('draft', 'passed', 'failed', 'needs_retest')),
  assessed_by varchar not null,
  assessed_at timestamptz not null default now(),
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operator_skill_changes (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.operator_skill_assessments(id) on delete set null,
  training_session_id uuid references public.operator_training_sessions(id) on delete set null,
  operator_id uuid not null references public.operators(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  change_type varchar not null check (change_type in ('created', 'updated', 'deleted')),
  old_level int check (old_level between 1 and 4),
  new_level int check (new_level between 1 and 4),
  old_status varchar,
  new_status varchar,
  changed_by varchar not null,
  reason text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_operator_training_sessions_operator_id on public.operator_training_sessions(operator_id);
create index if not exists idx_operator_training_sessions_skill_id on public.operator_training_sessions(skill_id);
create index if not exists idx_operator_training_sessions_status on public.operator_training_sessions(status);
create index if not exists idx_operator_skill_assessments_session_id on public.operator_skill_assessments(training_session_id);
create index if not exists idx_operator_skill_assessments_operator_id on public.operator_skill_assessments(operator_id);
create index if not exists idx_operator_skill_assessments_skill_id on public.operator_skill_assessments(skill_id);
create index if not exists idx_operator_skill_assessments_status on public.operator_skill_assessments(status);
create index if not exists idx_operator_skill_changes_assessment_id on public.operator_skill_changes(assessment_id);
create index if not exists idx_operator_skill_changes_operator_id on public.operator_skill_changes(operator_id);
create index if not exists idx_operator_skill_changes_skill_id on public.operator_skill_changes(skill_id);

drop trigger if exists trg_operator_training_sessions_updated_at on public.operator_training_sessions;
drop trigger if exists trg_operator_skill_assessments_updated_at on public.operator_skill_assessments;
drop trigger if exists trg_operator_skill_changes_updated_at on public.operator_skill_changes;
drop trigger if exists trg_operator_skill_assessments_audit on public.operator_skill_assessments;

create trigger trg_operator_training_sessions_updated_at
before update on public.operator_training_sessions
for each row execute function public.set_updated_at();

create trigger trg_operator_skill_assessments_updated_at
before update on public.operator_skill_assessments
for each row execute function public.set_updated_at();

create trigger trg_operator_skill_changes_updated_at
before update on public.operator_skill_changes
for each row execute function public.set_updated_at();

create or replace function public.sync_operator_skill_assessment()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.operator_skill_changes (
      assessment_id,
      training_session_id,
      operator_id,
      skill_id,
      change_type,
      old_level,
      new_level,
      old_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      new.training_session_id,
      new.operator_id,
      new.skill_id,
      'created',
      new.previous_level,
      new.assessed_level,
      null,
      new.status,
      new.assessed_by,
      coalesce(new.notes, 'Assessment created')
    );

    if new.status = 'passed' then
      insert into public.operator_skills (
        operator_id,
        skill_id,
        level,
        assessed_at,
        evidence_url,
        notes
      ) values (
        new.operator_id,
        new.skill_id,
        new.assessed_level,
        new.assessed_at,
        new.evidence_url,
        new.notes
      )
      on conflict (operator_id, skill_id) do update
      set level = excluded.level,
          assessed_at = excluded.assessed_at,
          evidence_url = excluded.evidence_url,
          notes = excluded.notes,
          updated_at = now();
    end if;

    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.operator_skill_changes (
      assessment_id,
      training_session_id,
      operator_id,
      skill_id,
      change_type,
      old_level,
      new_level,
      old_status,
      new_status,
      changed_by,
      reason
    ) values (
      new.id,
      new.training_session_id,
      new.operator_id,
      new.skill_id,
      'updated',
      old.assessed_level,
      new.assessed_level,
      old.status,
      new.status,
      new.assessed_by,
      coalesce(new.notes, 'Assessment updated')
    );

    if new.status = 'passed' then
      insert into public.operator_skills (
        operator_id,
        skill_id,
        level,
        assessed_at,
        evidence_url,
        notes
      ) values (
        new.operator_id,
        new.skill_id,
        new.assessed_level,
        new.assessed_at,
        new.evidence_url,
        new.notes
      )
      on conflict (operator_id, skill_id) do update
      set level = excluded.level,
          assessed_at = excluded.assessed_at,
          evidence_url = excluded.evidence_url,
          notes = excluded.notes,
          updated_at = now();
    end if;

    return new;
  elsif tg_op = 'DELETE' then
    insert into public.operator_skill_changes (
      assessment_id,
      training_session_id,
      operator_id,
      skill_id,
      change_type,
      old_level,
      new_level,
      old_status,
      new_status,
      changed_by,
      reason
    ) values (
      old.id,
      old.training_session_id,
      old.operator_id,
      old.skill_id,
      'deleted',
      old.assessed_level,
      null,
      old.status,
      null,
      old.assessed_by,
      coalesce(old.notes, 'Assessment deleted')
    );

    return old;
  end if;

  return null;
end;
$$;

create trigger trg_operator_skill_assessments_audit
after insert or update or delete on public.operator_skill_assessments
for each row execute function public.sync_operator_skill_assessment();