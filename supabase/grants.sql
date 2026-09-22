-- AURA — otorga permisos de Postgres a los roles de Supabase
-- Correr esto UNA VEZ, después de schema.sql (arregla un 403 "permission denied")

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.patients,
  public.professionals,
  public.treatments,
  public.supplies,
  public.treatment_supplies,
  public.appointments,
  public.alert_rules
to authenticated;

grant usage, select on all sequences in schema public to authenticated;
