-- AURA — Semanas 9, 10 y 11
--   9: roles y permisos reales, profesionales por tratamiento, invitaciones
--  10: alertas operativas y recordatorios guardados en la base
--  11: datos y horarios del centro
-- Además endurece la seguridad: las políticas RLS pasan a chequear el
-- permiso del rol del usuario logueado, no solo "estar logueado".
--
-- Correr UNA sola vez en el SQL Editor de Supabase, después de todos los
-- scripts anteriores. Las cuentas que hoy tienen rol "Administrador" lo
-- conservan; las que tienen "Operador" pasan al rol Operador nuevo.

-- ============================================================
-- SEMANA 9 — Roles y permisos
-- ============================================================
create table roles (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text not null default '',
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- Catálogo fijo: cada permiso habilita una acción sobre un módulo. El código
-- lo usan tanto la interfaz (para mostrar u ocultar) como las políticas RLS.
create table permissions (
  id bigint generated always as identity primary key,
  code text not null unique,
  module text not null,
  description text not null
);

create table role_permissions (
  role_id bigint not null references roles (id) on delete cascade,
  permission_id bigint not null references permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

insert into roles (name, description) values
  ('Administrador', 'Acceso completo, incluida la gestión de empleados, roles y la configuración del centro.'),
  ('Operador', 'Recepción: gestiona agenda, clientes y alertas; consulta el resto.'),
  ('Profesional', 'Consulta su agenda, las fichas de clientes y el catálogo; no modifica datos.');

insert into permissions (code, module, description) values
  ('dashboard.view', 'Panel principal', 'Ver el panel principal'),
  ('schedule.view', 'Agenda', 'Ver la agenda de turnos'),
  ('schedule.manage', 'Agenda', 'Crear, editar y cancelar turnos'),
  ('patients.view', 'Clientes', 'Ver clientes y sus fichas'),
  ('patients.manage', 'Clientes', 'Crear, editar y dar de baja clientes'),
  ('treatments.view', 'Tratamientos', 'Ver el catálogo de tratamientos'),
  ('treatments.manage', 'Tratamientos', 'Crear y editar tratamientos, sus insumos y recomendaciones'),
  ('supplies.view', 'Insumos', 'Ver el stock de insumos'),
  ('supplies.manage', 'Insumos', 'Crear y editar insumos y exportar el stock'),
  ('alerts.view', 'Alertas', 'Ver las alertas operativas'),
  ('alerts.manage', 'Alertas', 'Atender y resolver alertas y enviar recordatorios'),
  ('reports.view', 'Reportes', 'Ver los reportes operativos'),
  ('reports.export', 'Reportes', 'Exportar reportes en PDF'),
  ('scoring.view', 'AI Patient Scoring', 'Ver la priorización de clientes y generar recomendaciones con IA'),
  ('employees.manage', 'Empleados y roles', 'Gestionar empleados, profesionales, roles e invitaciones'),
  ('settings.manage', 'Configuración', 'Modificar los datos del centro, horarios y reglas de alerta');

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.name = 'Administrador';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in (
  'dashboard.view', 'schedule.view', 'schedule.manage', 'patients.view', 'patients.manage',
  'treatments.view', 'supplies.view', 'alerts.view', 'alerts.manage', 'reports.view', 'scoring.view'
)
where r.name = 'Operador';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in (
  'dashboard.view', 'schedule.view', 'patients.view', 'treatments.view', 'supplies.view', 'alerts.view', 'scoring.view'
)
where r.name = 'Profesional';

-- El rol deja de ser un texto libre en profiles y pasa a apuntar a roles.
alter table profiles add column role_id bigint references roles (id);
update profiles set role_id = (select id from roles where name = profiles.role);
update profiles set role_id = (select id from roles where name = 'Operador') where role_id is null;
alter table profiles alter column role_id set not null;
alter table profiles drop column role;

-- Profesionales como usuarios: una cuenta puede quedar vinculada a su
-- ficha de profesional (así ve "sus" turnos en la agenda).
alter table profiles add column professional_id bigint unique references professionals (id) on delete set null;

-- ============================================================
-- SEMANA 9 — Qué tratamientos realiza cada profesional
-- ============================================================
create table professional_treatments (
  professional_id bigint not null references professionals (id) on delete cascade,
  treatment_id bigint not null references treatments (id) on delete cascade,
  primary key (professional_id, treatment_id)
);

-- Asignación inicial según la especialidad de cada profesional de seed.sql
insert into professional_treatments (professional_id, treatment_id)
select p.id, t.id
from professionals p
join treatments t on (p.id, t.id) in (
  values (1, 1), (1, 2), (1, 6),
         (2, 3),
         (3, 4), (3, 5),
         (4, 4), (4, 5),
         (5, 1), (5, 2), (5, 6)
);

-- ============================================================
-- SEMANA 9 — Invitaciones de cuenta
-- El administrador genera un enlace con token; quien se registra con ese
-- enlace entra con el rol (y el profesional) que se le asignó. Quien se
-- registra sin invitación queda Inactivo hasta que un administrador lo active.
-- ============================================================
create table account_invitations (
  id bigint generated always as identity primary key,
  email text not null,
  role_id bigint not null references roles (id),
  professional_id bigint references professionals (id) on delete set null,
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Usada', 'Cancelada')),
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz
);

-- La pantalla de registro todavía no tiene sesión: esta función es la única
-- forma de leer una invitación, y solo devuelve email y rol si sigue vigente.
create function public.get_invitation(invite_token uuid)
returns table (email text, role_name text)
language sql
stable
security definer
set search_path = public
as $$
  select i.email, r.name
  from account_invitations i
  join roles r on r.id = i.role_id
  where i.token = invite_token and i.status = 'Pendiente' and i.expires_at > now();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation account_invitations%rowtype;
begin
  select * into invitation
  from account_invitations
  where token::text = new.raw_user_meta_data ->> 'invitation_token'
    and lower(email) = lower(new.email)
    and status = 'Pendiente'
    and expires_at > now();

  insert into profiles (id, first_name, last_name, email, username, role_id, professional_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'username',
    coalesce(invitation.role_id, (select id from roles where name = 'Operador')),
    invitation.professional_id,
    case when invitation.id is null then 'Inactivo' else 'Activo' end
  );

  if invitation.id is not null then
    update account_invitations set status = 'Usada', used_at = now() where id = invitation.id;
  end if;

  return new;
end;
$$;

-- ============================================================
-- SEMANA 9 — Funciones que usan las políticas RLS
-- security definer: leen profiles/roles sin pasar por RLS (evita recursión).
-- ============================================================
create function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'Activo');
$$;

create function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles pr
    join role_permissions rp on rp.role_id = pr.role_id
    join permissions p on p.id = rp.permission_id
    where pr.id = auth.uid() and pr.status = 'Activo' and p.code = permission_code
  );
$$;

-- ============================================================
-- SEMANA 10 — Alertas operativas
-- Stock bajo y turnos próximos los genera sync_operational_alerts() a partir
-- de los datos reales; las administrativas las carga un usuario a mano.
-- ============================================================
create table operational_alerts (
  id bigint generated always as identity primary key,
  type text not null check (type in ('Stock bajo', 'Turno próximo', 'Administrativa')),
  priority text not null default 'Media' check (priority in ('Alta', 'Media', 'Baja')),
  title text not null,
  detail text not null default '',
  status text not null default 'Activa' check (status in ('Activa', 'Atendida', 'Resuelta')),
  -- Identifica qué la originó ("stock-5", "appointment-12") para no duplicarla.
  source_key text,
  supply_id bigint references supplies (id) on delete cascade,
  appointment_id bigint references appointments (id) on delete cascade,
  patient_id bigint references patients (id) on delete cascade,
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  managed_by uuid references auth.users (id),
  managed_at timestamptz,
  resolved_at timestamptz
);

-- Una sola alerta abierta por origen; si se resuelve y el problema vuelve,
-- se crea una nueva (las resueltas quedan como historial).
create unique index operational_alerts_open_source_key
  on operational_alerts (source_key) where status <> 'Resuelta';

create table reminders (
  id bigint generated always as identity primary key,
  operational_alert_id bigint references operational_alerts (id) on delete set null,
  patient_id bigint not null references patients (id) on delete cascade,
  appointment_id bigint references appointments (id) on delete set null,
  channel text not null check (channel in ('WhatsApp', 'Email')),
  subject text not null default '',
  message text not null,
  delivery_status text not null default 'Enviado',
  created_by uuid references auth.users (id) default auth.uid(),
  sent_at timestamptz not null default now()
);

create function public.sync_operational_alerts()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rules alert_rules%rowtype;
begin
  if not is_active_user() then
    raise exception 'Usuario sin acceso';
  end if;

  select * into rules from alert_rules where id = 1;

  if rules.low_stock_alert_enabled then
    insert into operational_alerts (type, priority, title, detail, source_key, supply_id, created_by)
    select
      'Stock bajo',
      case when s.current_stock = 0 then 'Alta' else 'Media' end,
      'Stock bajo: ' || s.name,
      'Quedan ' || s.current_stock || ' ' || s.unit || ' (mínimo ' || s.min_stock || ').',
      'stock-' || s.id,
      s.id,
      null
    from supplies s
    where s.status = 'Activo' and s.current_stock <= s.min_stock
    on conflict (source_key) where status <> 'Resuelta'
    do update set priority = excluded.priority, title = excluded.title, detail = excluded.detail;
  end if;

  update operational_alerts a
  set status = 'Resuelta', resolved_at = now()
  where a.type = 'Stock bajo'
    and a.status <> 'Resuelta'
    and (not rules.low_stock_alert_enabled or not exists (
      select 1 from supplies s
      where s.id = a.supply_id and s.status = 'Activo' and s.current_stock <= s.min_stock
    ));

  if rules.upcoming_appointment_alert_enabled then
    insert into operational_alerts (type, priority, title, detail, source_key, appointment_id, patient_id, created_by)
    select
      'Turno próximo',
      case when ap.date <= current_date + 1 then 'Alta' else 'Media' end,
      'Turno sin confirmar: ' || p.first_name || ' ' || p.last_name,
      to_char(ap.date, 'DD/MM') || ' ' || left(ap.start_time::text, 5) || ' hs — ' || t.name || '. Pendiente de confirmación.',
      'appointment-' || ap.id,
      ap.id,
      ap.patient_id,
      null
    from appointments ap
    join patients p on p.id = ap.patient_id
    join treatments t on t.id = ap.treatment_id
    where ap.status = 'Pendiente'
      and ap.date between current_date and current_date + rules.upcoming_appointment_days
    on conflict (source_key) where status <> 'Resuelta'
    do update set priority = excluded.priority, title = excluded.title, detail = excluded.detail;
  end if;

  update operational_alerts a
  set status = 'Resuelta', resolved_at = now()
  where a.type = 'Turno próximo'
    and a.status <> 'Resuelta'
    and (not rules.upcoming_appointment_alert_enabled or not exists (
      select 1 from appointments ap
      where ap.id = a.appointment_id and ap.status = 'Pendiente' and ap.date >= current_date
    ));
end;
$$;

-- Los avisos administrativos que antes eran datos fijos (mocks/alerts.json)
insert into operational_alerts (type, priority, title, detail, created_by) values
  ('Administrativa', 'Media', 'Matrícula próxima a vencer', 'La matrícula de Paula Ibáñez vence en 15 días.', null),
  ('Administrativa', 'Baja', 'Revisión de higiene programada', 'Auditoría interna de bioseguridad programada para la próxima semana.', null);

-- ============================================================
-- SEMANA 11 — Datos y horarios del centro
-- AURA administra un solo centro, así que workspace es una fila única
-- (igual que alert_rules); no se implementa multi-tenant.
-- ============================================================
create table workspace (
  id int primary key default 1 check (id = 1),
  name text not null,
  activity_type text not null default '',
  business_email text not null default '',
  business_phone text not null default '',
  address text not null default '',
  allow_appointment_overlap boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into workspace (id, name, activity_type) values (1, 'Wellnest Tech', 'Centro de estética y bienestar');

-- day_of_week: 0 = domingo ... 6 = sábado (igual que Date.getDay() en JavaScript)
create table workspace_schedule_ranges (
  id bigint generated always as identity primary key,
  day_of_week int not null unique check (day_of_week between 0 and 6),
  opening_time time not null,
  closing_time time not null check (closing_time > opening_time),
  is_active boolean not null default true
);

insert into workspace_schedule_ranges (day_of_week, opening_time, closing_time, is_active) values
  (0, '09:00', '13:00', false),
  (1, '09:00', '20:00', true),
  (2, '09:00', '20:00', true),
  (3, '09:00', '20:00', true),
  (4, '09:00', '20:00', true),
  (5, '09:00', '20:00', true),
  (6, '09:00', '18:00', true);

-- ============================================================
-- Notas internas de la ficha del cliente (antes se perdían al salir)
-- ============================================================
alter table patients add column internal_notes text not null default '';

-- ============================================================
-- SEGURIDAD — Políticas RLS por permiso
-- Lectura: cualquier empleado activo (los módulos se cruzan: la agenda
-- necesita nombres de clientes, los reportes leen turnos, etc.).
-- Escritura: solo quien tiene el permiso "manage" del módulo.
-- Desactivar a un empleado le corta el acceso a todo, no solo en la UI.
-- ============================================================
drop policy if exists "Authenticated full access profiles" on profiles;
drop policy if exists "Authenticated full access patients" on patients;
drop policy if exists "Authenticated full access professionals" on professionals;
drop policy if exists "Authenticated full access treatments" on treatments;
drop policy if exists "Authenticated full access supplies" on supplies;
drop policy if exists "Authenticated full access treatment_supplies" on treatment_supplies;
drop policy if exists "Authenticated full access appointments" on appointments;
drop policy if exists "Authenticated full access alert_rules" on alert_rules;
drop policy if exists "Authenticated full access operational_reports" on operational_reports;
drop policy if exists "Authenticated full access stock_exports" on stock_exports;
drop policy if exists "Authenticated full access treatment_recommendations" on treatment_recommendations;

-- profiles: cada uno puede leer su propio perfil aunque esté inactivo
-- (así la app puede avisarle que su cuenta está pendiente de activación).
create policy "Read profiles" on profiles for select to authenticated
  using (id = auth.uid() or is_active_user());
create policy "Manage profiles" on profiles for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

create policy "Read patients" on patients for select to authenticated using (is_active_user());
create policy "Manage patients" on patients for all to authenticated
  using (has_permission('patients.manage')) with check (has_permission('patients.manage'));

create policy "Read professionals" on professionals for select to authenticated using (is_active_user());
create policy "Manage professionals" on professionals for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

create policy "Read treatments" on treatments for select to authenticated using (is_active_user());
create policy "Manage treatments" on treatments for all to authenticated
  using (has_permission('treatments.manage')) with check (has_permission('treatments.manage'));

create policy "Read treatment_supplies" on treatment_supplies for select to authenticated using (is_active_user());
create policy "Manage treatment_supplies" on treatment_supplies for all to authenticated
  using (has_permission('treatments.manage')) with check (has_permission('treatments.manage'));

create policy "Read treatment_recommendations" on treatment_recommendations for select to authenticated using (is_active_user());
create policy "Manage treatment_recommendations" on treatment_recommendations for all to authenticated
  using (has_permission('treatments.manage')) with check (has_permission('treatments.manage'));

create policy "Read supplies" on supplies for select to authenticated using (is_active_user());
create policy "Manage supplies" on supplies for all to authenticated
  using (has_permission('supplies.manage')) with check (has_permission('supplies.manage'));

create policy "Read stock_exports" on stock_exports for select to authenticated using (is_active_user());
create policy "Manage stock_exports" on stock_exports for all to authenticated
  using (has_permission('supplies.manage')) with check (has_permission('supplies.manage'));

create policy "Read appointments" on appointments for select to authenticated using (is_active_user());
create policy "Manage appointments" on appointments for all to authenticated
  using (has_permission('schedule.manage')) with check (has_permission('schedule.manage'));

create policy "Read alert_rules" on alert_rules for select to authenticated using (is_active_user());
create policy "Manage alert_rules" on alert_rules for all to authenticated
  using (has_permission('settings.manage')) with check (has_permission('settings.manage'));

create policy "Read operational_reports" on operational_reports for select to authenticated using (is_active_user());
create policy "Manage operational_reports" on operational_reports for all to authenticated
  using (has_permission('reports.export')) with check (has_permission('reports.export'));

alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table professional_treatments enable row level security;
alter table account_invitations enable row level security;
alter table operational_alerts enable row level security;
alter table reminders enable row level security;
alter table workspace enable row level security;
alter table workspace_schedule_ranges enable row level security;

create policy "Read roles" on roles for select to authenticated using (is_active_user());
create policy "Manage roles" on roles for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

create policy "Read permissions" on permissions for select to authenticated using (is_active_user());

create policy "Read role_permissions" on role_permissions for select to authenticated using (is_active_user());
create policy "Manage role_permissions" on role_permissions for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

create policy "Read professional_treatments" on professional_treatments for select to authenticated using (is_active_user());
create policy "Manage professional_treatments" on professional_treatments for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

-- Las invitaciones solo las ve quien administra empleados.
create policy "Manage account_invitations" on account_invitations for all to authenticated
  using (has_permission('employees.manage')) with check (has_permission('employees.manage'));

create policy "Read operational_alerts" on operational_alerts for select to authenticated using (is_active_user());
create policy "Manage operational_alerts" on operational_alerts for all to authenticated
  using (has_permission('alerts.manage')) with check (has_permission('alerts.manage'));

create policy "Read reminders" on reminders for select to authenticated using (is_active_user());
create policy "Manage reminders" on reminders for all to authenticated
  using (has_permission('alerts.manage')) with check (has_permission('alerts.manage'));

create policy "Read workspace" on workspace for select to authenticated using (is_active_user());
create policy "Manage workspace" on workspace for all to authenticated
  using (has_permission('settings.manage')) with check (has_permission('settings.manage'));

create policy "Read workspace_schedule_ranges" on workspace_schedule_ranges for select to authenticated using (is_active_user());
create policy "Manage workspace_schedule_ranges" on workspace_schedule_ranges for all to authenticated
  using (has_permission('settings.manage')) with check (has_permission('settings.manage'));

-- ============================================================
-- Permisos de Postgres (sin esto, Supabase responde 403 aunque RLS lo permita)
-- ============================================================
grant select, insert, update, delete on
  public.roles,
  public.role_permissions,
  public.professional_treatments,
  public.account_invitations,
  public.operational_alerts,
  public.reminders,
  public.workspace,
  public.workspace_schedule_ranges
to authenticated;
grant select on public.permissions to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.is_active_user() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.sync_operational_alerts() to authenticated;
grant execute on function public.get_invitation(uuid) to anon, authenticated;
