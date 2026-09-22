-- AURA — tabla contact_inquiry (consultas del formulario público de Contacto)
-- Correr en el SQL Editor de Supabase, después de grants.sql

create table contact_inquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  activity_type text,
  reason text,
  message text not null,
  status text not null default 'Nueva' check (status in ('Nueva', 'Atendida'))
);

alter table contact_inquiries enable row level security;

-- Cualquier visitante (sin login) puede enviar una consulta desde la landing.
create policy "Anyone can submit a contact inquiry" on contact_inquiries
  for insert to anon, authenticated with check (true);

-- Solo el personal logueado puede leerlas (para una futura pantalla de bandeja de consultas).
create policy "Authenticated can view contact inquiries" on contact_inquiries
  for select to authenticated using (true);

grant usage on schema public to anon;
grant insert on public.contact_inquiries to anon;
grant select, insert on public.contact_inquiries to authenticated;
grant usage, select on sequence contact_inquiries_id_seq to anon, authenticated;
