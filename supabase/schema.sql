-- AURA — esquema de base de datos para Supabase (Postgres)
-- Pegar y ejecutar en Supabase: Project > SQL Editor > New query

-- ============================================================
-- Tabla de perfiles (extiende auth.users con datos de la app)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null default 'Operador' check (role in ('Administrador', 'Operador')),
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo')),
  created_at timestamptz not null default now()
);

-- Crea automáticamente un perfil cuando alguien se registra con Supabase Auth.
-- Copiamos el email acá porque auth.users no es consultable desde el cliente.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Pacientes
-- ============================================================
create table patients (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  document_id text not null unique,
  birth_date date,
  phone text,
  email text not null,
  address text,
  registered_at date not null default current_date,
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo'))
);

-- ============================================================
-- Profesionales
-- ============================================================
create table professionals (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  document_id text not null unique,
  license_number text,
  phone text,
  email text not null,
  specialty text,
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo'))
);

-- ============================================================
-- Tratamientos
-- ============================================================
create table treatments (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  category text,
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo'))
);

-- ============================================================
-- Insumos
-- ============================================================
create table supplies (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  current_stock int not null default 0 check (current_stock >= 0),
  min_stock int not null default 0 check (min_stock >= 0),
  unit text not null default 'unidades',
  category text,
  price numeric(10, 2) default 0,
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo'))
);

-- ============================================================
-- Relación N:M Tratamiento-Insumo
-- ============================================================
create table treatment_supplies (
  id bigint generated always as identity primary key,
  treatment_id bigint not null references treatments (id) on delete cascade,
  supply_id bigint not null references supplies (id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  unique (treatment_id, supply_id)
);

-- ============================================================
-- Turnos
-- ============================================================
create table appointments (
  id bigint generated always as identity primary key,
  patient_id bigint not null references patients (id),
  professional_id bigint not null references professionals (id),
  treatment_id bigint not null references treatments (id),
  date date not null,
  start_time time not null,
  end_time time not null check (end_time > start_time),
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Confirmado', 'Realizado', 'Cancelado')),
  notes text default ''
);

-- ============================================================
-- Reglas de alerta (fila única de configuración)
-- ============================================================
create table alert_rules (
  id int primary key default 1 check (id = 1),
  upcoming_appointment_days int not null default 2,
  low_stock_alert_enabled boolean not null default true,
  upcoming_appointment_alert_enabled boolean not null default true,
  administrative_alert_enabled boolean not null default true
);

insert into alert_rules (id) values (1);

-- ============================================================
-- Row Level Security: cualquier usuario autenticado (empleado
-- logueado) puede leer y escribir. Simplifica el proyecto: el
-- control de qué puede hacer cada rol (Administrador/Operador)
-- se maneja en la interfaz de React, no a nivel de base de datos.
-- ============================================================
alter table profiles enable row level security;
alter table patients enable row level security;
alter table professionals enable row level security;
alter table treatments enable row level security;
alter table supplies enable row level security;
alter table treatment_supplies enable row level security;
alter table appointments enable row level security;
alter table alert_rules enable row level security;

-- Permisiva a propósito: cualquier empleado logueado puede administrar
-- roles de otros empleados desde la pantalla "Empleados y roles". El
-- control fino de qué puede hacer cada rol se maneja en la UI de React,
-- no a nivel de base de datos, para mantener el proyecto simple.
create policy "Authenticated full access profiles" on profiles for all to authenticated using (true) with check (true);

create policy "Authenticated full access patients" on patients for all to authenticated using (true) with check (true);
create policy "Authenticated full access professionals" on professionals for all to authenticated using (true) with check (true);
create policy "Authenticated full access treatments" on treatments for all to authenticated using (true) with check (true);
create policy "Authenticated full access supplies" on supplies for all to authenticated using (true) with check (true);
create policy "Authenticated full access treatment_supplies" on treatment_supplies for all to authenticated using (true) with check (true);
create policy "Authenticated full access appointments" on appointments for all to authenticated using (true) with check (true);
create policy "Authenticated full access alert_rules" on alert_rules for all to authenticated using (true) with check (true);
