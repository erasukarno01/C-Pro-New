-- Initial seed for C-PRO Supabase local project
-- Add reference/master data here as the schema expands.

insert into public.skill_levels (level, label, description)
values
  (1, 'Belajar', 'Dengan pengawasan ketat'),
  (2, 'Mampu', 'Mandiri'),
  (3, 'Terampil', 'Analitikal'),
  (4, 'Expert', 'Bisa melatih')
on conflict (level) do nothing;

insert into public.skills (code, name, description)
values
  ('SOLDER', 'Soldering', 'Kemampuan solder manual dan reflow'),
  ('INSPECT', 'Inspection', 'Kemampuan inspeksi visual dan functional'),
  ('ASSEMBLY', 'Assembly', 'Kemampuan perakitan workstation')
on conflict (code) do nothing;

insert into public.operators (nik, name, active)
values
  ('OP-001', 'Budi Santoso', true),
  ('OP-002', 'Siti Rahma', true),
  ('OP-003', 'Andi Pratama', true)
on conflict (nik) do nothing;

with operator_ref as (
  select id from public.operators where nik = 'OP-001'
), skill_ref as (
  select id from public.skills where code = 'SOLDER'
)
insert into public.operator_skills (operator_id, skill_id, level, assessed_at, certified_until, evidence_url, notes)
select operator_ref.id, skill_ref.id, 3, now() - interval '15 days', now() + interval '180 days', null, 'Seed skill'
from operator_ref, skill_ref
on conflict (operator_id, skill_id) do nothing;

with operator_ref as (
  select id from public.operators where nik = 'OP-002'
), skill_ref as (
  select id from public.skills where code = 'ASSEMBLY'
)
insert into public.operator_skills (operator_id, skill_id, level, assessed_at, certified_until, evidence_url, notes)
select operator_ref.id, skill_ref.id, 2, now() - interval '20 days', now() + interval '120 days', null, 'Seed skill'
from operator_ref, skill_ref
on conflict (operator_id, skill_id) do nothing;

with operator_ref as (
  select id from public.operators where nik = 'OP-001'
), skill_ref as (
  select id from public.skills where code = 'SOLDER'
)
insert into public.operator_training_sessions (training_code, operator_id, skill_id, trainer_name, scheduled_at, completed_at, status, location, notes)
select 'TRN-2026-001', operator_ref.id, skill_ref.id, 'Supervisor Demo', now() - interval '2 days', now() - interval '1 day', 'completed', 'Training Room A', 'Seed training session'
from operator_ref, skill_ref
on conflict (training_code) do nothing;

with session_ref as (
  select s.id, s.operator_id, s.skill_id
  from public.operator_training_sessions s
  where s.training_code = 'TRN-2026-001'
)
insert into public.operator_skill_assessments (training_session_id, operator_id, skill_id, previous_level, assessed_level, status, assessed_by, assessed_at, evidence_url, notes)
select session_ref.id, session_ref.operator_id, session_ref.skill_id, 2, 3, 'passed', 'Supervisor Demo', now() - interval '1 day', null, 'Seed assessment passed'
from session_ref
where not exists (
  select 1
  from public.operator_skill_assessments a
  where a.training_session_id = session_ref.id
);
