-- AURA — llena la Agenda del mes pasado y del mes actual (de lunes a sábado).
-- Los días pasados quedan Realizado (con algunos Cancelado), hoy Confirmado y
-- los futuros Pendiente/Confirmado. Los horarios no se pisan por profesional:
-- 4 franjas por día (09, 11, 14 y 16 hs) y cada tratamiento dura menos que el
-- hueco entre franjas. Usa solo los clientes originales (id <= 10) para no
-- alterar los puntajes de los clientes de seed_patients_scoring_demo.sql.
-- Correr UNA sola vez en el SQL Editor de Supabase (si se repite, duplica turnos).

with pats as (
  select id, row_number() over (order by id) - 1 as rn
  from patients
  where status = 'Activo' and id <= 10
),
treats as (
  select id, duration_minutes, row_number() over (order by id) - 1 as rn
  from treatments
  where status = 'Activo'
),
profs as (
  select id from professionals where status = 'Activo'
),
days as (
  select d::date as day
  from generate_series(
    (date_trunc('month', current_date) - interval '1 month')::date,
    (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date,
    interval '1 day'
  ) as d
  where extract(dow from d) <> 0
),
slots(slot_no, start_time) as (
  values (0, time '09:00'), (1, time '11:00'), (2, time '14:00'), (3, time '16:00')
),
picked as (
  select
    days.day,
    profs.id as professional_id,
    slots.start_time,
    (extract(doy from days.day)::int * 7 + profs.id::int * 13 + slots.slot_no * 5) as seed
  from days cross join profs cross join slots
  where (extract(doy from days.day)::int * 7 + profs.id::int * 13 + slots.slot_no * 5) % 10 < 5
)
insert into appointments (patient_id, professional_id, treatment_id, date, start_time, end_time, status, notes)
select
  pat.id,
  picked.professional_id,
  t.id,
  picked.day,
  picked.start_time,
  picked.start_time + make_interval(mins => t.duration_minutes),
  case
    when picked.day < current_date then
      case when picked.seed % 7 = 0 then 'Cancelado' else 'Realizado' end
    when picked.day = current_date then 'Confirmado'
    else
      case when picked.seed % 3 = 0 then 'Confirmado' else 'Pendiente' end
  end,
  ''
from picked
join pats pat on pat.rn = picked.seed % (select count(*) from pats)
join treats t on t.rn = (picked.seed / 3) % (select count(*) from treats);
