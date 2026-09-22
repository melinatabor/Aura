-- AURA — seed de turnos de ejemplo (Semana 7)
-- Correr en el SQL Editor de Supabase, despues de seed.sql

insert into appointments (id, patient_id, professional_id, treatment_id, date, start_time, end_time, status, notes) overriding system value values
  (1, 1, 1, 1, (current_date)::date, '09:00', '10:00', 'Confirmado', ''),
  (2, 2, 3, 4, (current_date)::date, '10:30', '11:20', 'Pendiente', 'Primera sesión'),
  (3, 3, 2, 3, (current_date)::date, '14:00', '14:40', 'Confirmado', ''),
  (4, 5, 4, 5, (current_date)::date, '16:00', '17:00', 'Pendiente', ''),
  (5, 6, 1, 2, (current_date + interval '1 day')::date, '09:30', '10:15', 'Confirmado', ''),
  (6, 7, 3, 4, (current_date + interval '1 day')::date, '11:00', '11:50', 'Pendiente', ''),
  (7, 8, 2, 3, (current_date + interval '1 day')::date, '13:30', '14:10', 'Confirmado', 'Consultar alergias'),
  (8, 1, 4, 5, (current_date + interval '2 day')::date, '10:00', '11:00', 'Pendiente', ''),
  (9, 9, 1, 1, (current_date + interval '2 day')::date, '15:00', '16:00', 'Cancelado', 'Paciente reprogramó'),
  (10, 10, 3, 4, (current_date + interval '3 day')::date, '09:00', '09:50', 'Pendiente', ''),
  (11, 4, 2, 3, (current_date + interval '3 day')::date, '12:00', '12:40', 'Confirmado', ''),
  (12, 5, 1, 6, (current_date + interval '4 day')::date, '10:00', '10:30', 'Pendiente', ''),
  (13, 6, 4, 5, (current_date + interval '4 day')::date, '14:30', '15:30', 'Confirmado', ''),
  (14, 3, 3, 4, (current_date + interval '5 day')::date, '11:30', '12:20', 'Pendiente', ''),
  (15, 7, 1, 1, (current_date + interval '-1 day')::date, '09:00', '10:00', 'Realizado', ''),
  (16, 8, 2, 3, (current_date + interval '-1 day')::date, '16:00', '16:40', 'Realizado', ''),
  (17, 2, 4, 5, (current_date + interval '-2 day')::date, '10:00', '11:00', 'Realizado', ''),
  (18, 10, 1, 2, (current_date + interval '6 day')::date, '09:30', '10:15', 'Pendiente', '');

select setval(pg_get_serial_sequence('appointments', 'id'), (select max(id) from appointments));
