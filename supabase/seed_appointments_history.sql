-- AURA — turnos "Realizado" de los últimos 30 días, para que el gráfico de
-- tendencia de Reportes (y Ocupación/Desempeño) tengan una historia real en
-- vez de un solo pico. Correr en el SQL Editor de Supabase, después de
-- seed.sql y seed_appointments.sql.
--
-- No fija IDs explícitos (a diferencia de seed_appointments.sql): así no
-- pisa turnos que ya se hayan creado desde la app.

insert into appointments (patient_id, professional_id, treatment_id, date, start_time, end_time, status, notes) values
  (2, 1, 1, (current_date - interval '30 day')::date, '09:00', '10:00', 'Realizado', ''),
  (4, 3, 4, (current_date - interval '28 day')::date, '10:30', '11:20', 'Realizado', ''),
  (6, 2, 3, (current_date - interval '26 day')::date, '14:00', '14:40', 'Realizado', ''),
  (8, 4, 5, (current_date - interval '24 day')::date, '16:00', '17:00', 'Realizado', ''),
  (10, 1, 2, (current_date - interval '22 day')::date, '09:30', '10:15', 'Realizado', ''),
  (1, 3, 4, (current_date - interval '20 day')::date, '11:00', '11:50', 'Realizado', ''),
  (3, 2, 3, (current_date - interval '18 day')::date, '13:30', '14:10', 'Realizado', ''),
  (5, 4, 6, (current_date - interval '16 day')::date, '10:00', '10:30', 'Realizado', ''),
  (7, 1, 1, (current_date - interval '14 day')::date, '15:00', '16:00', 'Realizado', ''),
  (9, 3, 4, (current_date - interval '13 day')::date, '09:00', '09:50', 'Realizado', ''),
  (2, 2, 3, (current_date - interval '12 day')::date, '12:00', '12:40', 'Realizado', ''),
  (4, 1, 6, (current_date - interval '11 day')::date, '10:00', '10:30', 'Realizado', ''),
  (6, 4, 5, (current_date - interval '10 day')::date, '14:30', '15:30', 'Realizado', ''),
  (8, 3, 4, (current_date - interval '9 day')::date, '11:30', '12:20', 'Realizado', ''),
  (10, 1, 1, (current_date - interval '8 day')::date, '09:00', '10:00', 'Realizado', ''),
  (1, 2, 3, (current_date - interval '7 day')::date, '16:00', '16:40', 'Realizado', ''),
  (3, 4, 5, (current_date - interval '6 day')::date, '10:00', '11:00', 'Realizado', ''),
  (5, 1, 2, (current_date - interval '5 day')::date, '09:30', '10:15', 'Realizado', ''),
  (7, 3, 4, (current_date - interval '4 day')::date, '11:00', '11:50', 'Realizado', ''),
  (9, 2, 3, (current_date - interval '3 day')::date, '13:30', '14:10', 'Realizado', ''),
  (2, 4, 6, (current_date - interval '2 day')::date, '10:00', '10:30', 'Realizado', ''),
  (4, 1, 1, (current_date - interval '1 day')::date, '15:00', '16:00', 'Realizado', '');
