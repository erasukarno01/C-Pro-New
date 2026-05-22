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
