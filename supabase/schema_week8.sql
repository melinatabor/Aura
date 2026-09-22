-- AURA — Semana 8: reportes persistidos, exportación de stock y recomendaciones de tratamientos
-- Correr en el SQL Editor de Supabase, después de los scripts anteriores

-- ============================================================
-- operational_report + report_export (unificados en una sola tabla:
-- en esta versión ambas acciones ocurren en el mismo momento, al
-- tocar "Exportar reporte", así que se simplifican en un solo registro)
-- ============================================================
create table operational_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  generated_by uuid references auth.users (id),
  period_from date not null,
  period_to date not null,
  total_revenue numeric(12, 2) not null default 0,
  completed_appointments int not null default 0,
  active_patients int not null default 0,
  occupancy_by_professional jsonb not null default '[]',
  performance_by_treatment jsonb not null default '[]'
);

alter table operational_reports enable row level security;
create policy "Authenticated full access operational_reports" on operational_reports
  for all to authenticated using (true) with check (true);
grant select, insert on public.operational_reports to authenticated;
grant usage, select on sequence operational_reports_id_seq to authenticated;

-- ============================================================
-- stock_export
-- ============================================================
create table stock_exports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  generated_by uuid references auth.users (id),
  low_stock_count int not null default 0,
  total_supplies int not null default 0,
  total_value numeric(12, 2) not null default 0,
  snapshot jsonb not null default '[]'
);

alter table stock_exports enable row level security;
create policy "Authenticated full access stock_exports" on stock_exports
  for all to authenticated using (true) with check (true);
grant select, insert on public.stock_exports to authenticated;
grant usage, select on sequence stock_exports_id_seq to authenticated;

-- ============================================================
-- treatment_recommendation (tratamiento -> tratamiento recomendado,
-- ej. "quienes hacen Limpieza facial también suelen pedir Peeling")
-- ============================================================
create table treatment_recommendations (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  treatment_origin_id bigint not null references treatments (id) on delete cascade,
  treatment_recommended_id bigint not null references treatments (id) on delete cascade,
  relation_sequence int not null default 1,
  unique (treatment_origin_id, treatment_recommended_id)
);

alter table treatment_recommendations enable row level security;
create policy "Authenticated full access treatment_recommendations" on treatment_recommendations
  for all to authenticated using (true) with check (true);
grant select, insert, delete on public.treatment_recommendations to authenticated;
grant usage, select on sequence treatment_recommendations_id_seq to authenticated;

-- Datos de ejemplo (asumen los ids sembrados en seed.sql: 1=Limpieza facial,
-- 2=Peeling químico, 3=Depilación láser, 4=Masaje descontracturante, 5=Drenaje linfático)
insert into treatment_recommendations (treatment_origin_id, treatment_recommended_id, relation_sequence) values
  (1, 2, 1),
  (2, 1, 1),
  (4, 5, 1),
  (5, 4, 1);
