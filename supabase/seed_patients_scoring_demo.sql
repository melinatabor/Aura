-- AURA — clientes de ejemplo con historiales bien distintos, pensados para que
-- AI Patient Scoring muestre las tres prioridades (Alta/Media/Baja) con casos
-- que se puedan explicar: no son al azar, cada uno ilustra un factor de la
-- fórmula (recencia, frecuencia, cancelaciones, o "todavía sin turnos").
-- Correr en el SQL Editor de Supabase, después de seed.sql y seed_appointments_history.sql.

with new_patients as (
  insert into patients (first_name, last_name, document_id, birth_date, phone, email, address, registered_at, status)
  values
    ('Rodrigo', 'Álvarez', '35112233', '1993-06-14', '+54 9 11 2211-3344', 'rodrigo.alvarez@mail.com', 'Av. Pueyrredón 1200, CABA', '2024-03-02', 'Activo'),
    ('Milagros', 'Vega', '36445566', '1995-10-09', '+54 9 11 3322-4455', 'milagros.vega@mail.com', 'Av. Callao 800, CABA', '2024-05-18', 'Activo'),
    ('Ezequiel', 'Romero', '31778899', '1989-01-27', '+54 9 11 4433-5566', 'ezequiel.romero@mail.com', 'Av. Independencia 2200, CABA', '2023-08-14', 'Activo'),
    ('Brisa', 'Cabrera', '38221144', '1998-12-05', '+54 9 11 5544-6677', 'brisa.cabrera@mail.com', 'Av. Scalabrini Ortiz 900, CABA', '2024-06-30', 'Activo'),
    ('Tomás', 'Herrera', '40556677', '2001-04-11', '+54 9 11 6655-7788', 'tomas.herrera@mail.com', 'Av. Directorio 1500, CABA', '2026-09-15', 'Activo'),
    ('Delfina', 'Ortiz', '33889900', '1991-09-23', '+54 9 11 7766-8899', 'delfina.ortiz@mail.com', 'Av. San Juan 2600, CABA', '2024-02-27', 'Activo')
  returning id, first_name
),
appts as (
  select * from (values
    -- Rodrigo Álvarez -> Alta: turnos frecuentes, recientes, sin cancelaciones
    ('Rodrigo', 1, 1, 2, 'Realizado'),
    ('Rodrigo', 2, 3, 6, 'Realizado'),
    ('Rodrigo', 3, 4, 11, 'Realizado'),
    ('Rodrigo', 4, 5, 16, 'Realizado'),
    -- Milagros Vega -> Media: actividad real pero no tan reciente
    ('Milagros', 1, 2, 22, 'Realizado'),
    ('Milagros', 2, 3, 28, 'Cancelado'),
    ('Milagros', 3, 6, 35, 'Realizado'),
    -- Ezequiel Romero -> Baja: buen historial, pero hace meses que no viene
    ('Ezequiel', 4, 1, 95, 'Realizado'),
    ('Ezequiel', 1, 4, 110, 'Realizado'),
    -- Brisa Cabrera -> Media: viene seguido pero cancela mucho (poco confiable)
    ('Brisa', 2, 3, 5, 'Cancelado'),
    ('Brisa', 3, 5, 15, 'Cancelado'),
    ('Brisa', 1, 2, 25, 'Realizado'),
    ('Brisa', 4, 6, 30, 'Cancelado'),
    -- Delfina Ortiz -> Media: cliente de base, sin cancelaciones, pero espaciada
    ('Delfina', 2, 1, 35, 'Realizado'),
    ('Delfina', 3, 4, 50, 'Realizado'),
    ('Delfina', 1, 5, 65, 'Realizado')
    -- Tomás Herrera -> Baja: recién se registró, todavía sin turnos (a propósito, sin filas acá)
  ) as x(patient_name, professional_id, treatment_id, days_ago, status)
)
insert into appointments (patient_id, professional_id, treatment_id, date, start_time, end_time, status, notes)
select
  (select id from new_patients where first_name = appts.patient_name),
  appts.professional_id,
  appts.treatment_id,
  (current_date - (appts.days_ago || ' day')::interval)::date,
  '10:00',
  '10:40',
  appts.status,
  ''
from appts;
