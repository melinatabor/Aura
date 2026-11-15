-- AURA — datos de demostración para que TODAS las pantallas se vean llenas.
-- Llena: clientes nuevos (con notas y turnos), historial de recordatorios,
-- alertas resueltas, historial de reportes y de exportaciones de stock,
-- consultas de contacto e invitaciones en distintos estados.
--
-- Orden recomendado en el SQL Editor (si aparece el aviso de RLS: "Run without RLS"):
--   1) seed_agenda_months.sql   (agenda de octubre y noviembre)
--   2) este archivo
-- Correr cada uno UNA sola vez (si se repite, duplica registros).

-- ============================================================
-- 1) Clientes nuevos (con notas internas)
-- ============================================================
insert into patients (first_name, last_name, document_id, birth_date, phone, email, address, registered_at, status, internal_notes) values
  ('Paula', 'Benítez', '34100201', '1992-02-11', '+54 9 11 4100-2201', 'paula.benitez@mail.com', 'Av. Corrientes 4100, CABA', current_date - 210, 'Activo', 'Piel sensible: consultar antes de aplicar ácidos.'),
  ('Nicolás', 'Paredes', '36200302', '1994-08-30', '+54 9 11 4200-3302', 'nicolas.paredes@mail.com', 'Cabildo 1800, CABA', current_date - 180, 'Activo', 'Prefiere turnos después de las 17 hs.'),
  ('Antonella', 'Rossi', '38300403', '1999-05-17', '+54 9 11 4300-4403', 'antonella.rossi@mail.com', 'Av. Libertador 3300, CABA', current_date - 150, 'Activo', ''),
  ('Gonzalo', 'Medina', '30400504', '1987-11-03', '+54 9 11 4400-5504', 'gonzalo.medina@mail.com', 'Av. Rivadavia 6200, CABA', current_date - 120, 'Activo', 'Contractura crónica en la espalda; deriva su kinesiólogo.'),
  ('Camila', 'Duarte', '40500605', '2000-01-25', '+54 9 11 4500-6605', 'camila.duarte@mail.com', 'Gorriti 5400, CABA', current_date - 95, 'Activo', 'Alérgica al látex.'),
  ('Joaquín', 'Salas', '33600706', '1991-07-14', '+54 9 11 4600-7706', 'joaquin.salas@mail.com', 'Av. Díaz Vélez 3900, CABA', current_date - 75, 'Activo', ''),
  ('Rocío', 'Navarro', '37700807', '1996-09-09', '+54 9 11 4700-8807', 'rocio.navarro@mail.com', 'Thames 1500, CABA', current_date - 40, 'Activo', 'Llegó por recomendación de Lucía Fernández.'),
  ('Facundo', 'Lemos', '35800908', '1993-12-21', '+54 9 11 4800-9908', 'facundo.lemos@mail.com', 'Av. San Martín 2700, CABA', current_date - 300, 'Inactivo', 'Se mudó de barrio; volver a contactar en primavera.')
on conflict (document_id) do nothing;

-- Notas para algunos clientes que ya existían
update patients set internal_notes = 'Clienta frecuente. Le gusta que le recuerden el turno por WhatsApp.'
  where document_id = '34521678' and internal_notes = '';
update patients set internal_notes = 'Prefiere turnos por la mañana.'
  where document_id = '31245789' and internal_notes = '';
update patients set internal_notes = 'Pidió presupuesto de un pack de depilación láser.'
  where document_id = '39876543' and internal_notes = '';

-- ============================================================
-- 2) Turnos de los clientes nuevos (pasados realizados + próximos)
--    Horarios 12:15 y 17:15 para no pisar los de seed_agenda_months.sql
-- ============================================================
insert into appointments (patient_id, professional_id, treatment_id, date, start_time, end_time, status, notes)
select p.id, v.professional_id, v.treatment_id, current_date + v.day_offset,
       v.start_time::time, v.start_time::time + make_interval(mins => t.duration_minutes), v.status, ''
from (values
  ('34100201', 1, 1, -40, '12:15', 'Realizado'),
  ('34100201', 1, 2, -12, '12:15', 'Realizado'),
  ('34100201', 1, 1,   3, '12:15', 'Confirmado'),
  ('36200302', 3, 4, -33, '17:15', 'Realizado'),
  ('36200302', 3, 4,  -5, '17:15', 'Realizado'),
  ('36200302', 4, 5,   6, '17:15', 'Pendiente'),
  ('38300403', 2, 3, -28, '12:15', 'Realizado'),
  ('38300403', 2, 3,  -7, '12:15', 'Cancelado'),
  ('38300403', 2, 3,   9, '12:15', 'Pendiente'),
  ('30400504', 3, 4, -21, '17:15', 'Realizado'),
  ('30400504', 4, 5,  -2, '17:15', 'Realizado'),
  ('30400504', 3, 4,  12, '17:15', 'Pendiente'),
  ('40500605', 1, 1, -18, '12:15', 'Realizado'),
  ('40500605', 1, 2,   4, '12:15', 'Pendiente'),
  ('33600706', 4, 5, -10, '17:15', 'Realizado'),
  ('33600706', 4, 5,  14, '17:15', 'Pendiente'),
  ('37700807', 1, 1,  -3, '12:15', 'Realizado'),
  ('37700807', 2, 3,   7, '12:15', 'Confirmado')
) as v(doc, professional_id, treatment_id, day_offset, start_time, status)
join patients p on p.document_id = v.doc
join treatments t on t.id = v.treatment_id;

-- ============================================================
-- 3) Insumos de los tratamientos que todavía no tenían (relación N:M)
-- ============================================================
insert into treatment_supplies (treatment_id, supply_id, quantity)
select v.treatment_id, v.supply_id, v.quantity
from (values (3, 5, 2), (3, 7, 1), (4, 6, 1), (4, 7, 1), (5, 6, 2), (5, 9, 1), (2, 4, 1), (2, 10, 1)) as v(treatment_id, supply_id, quantity)
where not exists (
  select 1 from treatment_supplies ts where ts.treatment_id = v.treatment_id and ts.supply_id = v.supply_id
);

-- ============================================================
-- 4) Recomendaciones entre tratamientos (para las sugerencias de la ficha)
-- ============================================================
insert into treatment_recommendations (treatment_origin_id, treatment_recommended_id, relation_sequence)
select v.a, v.b, v.n
from (values (3, 5, 1), (5, 3, 1), (1, 5, 2)) as v(a, b, n)
where not exists (
  select 1 from treatment_recommendations r where r.treatment_origin_id = v.a and r.treatment_recommended_id = v.b
);

-- ============================================================
-- 5) Alertas ya resueltas (historial) — pestaña "Resueltas" de Alertas
-- ============================================================
insert into operational_alerts (type, priority, title, detail, status, supply_id, created_at, managed_at, resolved_at)
select 'Stock bajo', v.priority, 'Stock bajo: ' || s.name, 'Se repuso el stock del insumo.', 'Resuelta', s.id,
       now() - make_interval(days => v.days_ago + 2), now() - make_interval(days => v.days_ago + 1), now() - make_interval(days => v.days_ago)
from (values ('Crema hidratante facial', 'Media', 20), ('Cera depilatoria', 'Alta', 14), ('Gasas estériles', 'Media', 9), ('Alcohol en gel', 'Media', 5)) as v(name, priority, days_ago)
join supplies s on s.name = v.name;

insert into operational_alerts (type, priority, title, detail, status, created_at, managed_at, resolved_at) values
  ('Administrativa', 'Alta', 'Renovar habilitación municipal', 'Presentar la documentación antes del vencimiento.', 'Resuelta', now() - interval '25 days', now() - interval '23 days', now() - interval '22 days'),
  ('Administrativa', 'Media', 'Auditoría de bioseguridad', 'Auditoría interna realizada y aprobada.', 'Resuelta', now() - interval '18 days', now() - interval '16 days', now() - interval '15 days'),
  ('Administrativa', 'Baja', 'Actualizar la lista de precios', 'Se actualizaron los precios del catálogo.', 'Resuelta', now() - interval '12 days', now() - interval '11 days', now() - interval '10 days');

-- Una alerta administrativa en seguimiento (Atendida, todavía abierta)
insert into operational_alerts (type, priority, title, detail, status, created_at, managed_at) values
  ('Administrativa', 'Media', 'Capacitación del equipo en primeros auxilios', 'Coordinar fecha con la empresa proveedora.', 'Atendida', now() - interval '4 days', now() - interval '2 days');

-- ============================================================
-- 6) Recordatorios enviados (historial) — pestaña "Recordatorios enviados"
-- ============================================================
insert into reminders (patient_id, channel, subject, message, delivery_status, sent_at)
select p.id, v.channel, case when v.channel = 'Email' then 'Recordatorio de turno — Wellnest Tech' else '' end,
       'Hola ' || p.first_name || '! Te recordamos tu turno de ' || v.treatment || ' en Wellnest Tech. ¿Nos confirmás tu asistencia? ¡Gracias!',
       'Enviado', now() - make_interval(days => v.days_ago, hours => v.hours_ago)
from (values
  ('34521678', 'WhatsApp', 'Limpieza facial profunda', 1, 3),
  ('31245789', 'WhatsApp', 'Drenaje linfático', 2, 5),
  ('39876543', 'Email', 'Depilación láser - Piernas', 3, 2),
  ('40123456', 'WhatsApp', 'Peeling químico', 4, 6),
  ('36789123', 'WhatsApp', 'Masaje descontracturante', 5, 1),
  ('33456789', 'Email', 'Limpieza facial profunda', 6, 4),
  ('38912345', 'WhatsApp', 'Drenaje linfático', 7, 7),
  ('34100201', 'WhatsApp', 'Peeling químico', 8, 2),
  ('36200302', 'Email', 'Masaje descontracturante', 9, 5),
  ('30400504', 'WhatsApp', 'Masaje descontracturante', 11, 3),
  ('40500605', 'WhatsApp', 'Limpieza facial profunda', 13, 6)
) as v(doc, channel, treatment, days_ago, hours_ago)
join patients p on p.document_id = v.doc;

-- ============================================================
-- 7) Historial de exportaciones de reportes (últimas semanas)
-- ============================================================
insert into operational_reports (created_at, period_from, period_to, total_revenue, completed_appointments, active_patients, occupancy_by_professional, performance_by_treatment)
select now() - make_interval(days => v.days_ago), current_date - v.days_ago - 30, current_date - v.days_ago,
       v.revenue, v.completed, v.active_patients,
       jsonb_build_array(
         jsonb_build_object('professional', 'María López', 'appointments', v.completed / 3),
         jsonb_build_object('professional', 'Laura García', 'appointments', v.completed / 4),
         jsonb_build_object('professional', 'Rocío Fernández', 'appointments', v.completed / 4)),
       jsonb_build_array(
         jsonb_build_object('treatment', 'Limpieza facial profunda', 'completed', v.completed / 3, 'revenue', v.revenue * 0.30),
         jsonb_build_object('treatment', 'Depilación láser - Piernas', 'completed', v.completed / 4, 'revenue', v.revenue * 0.22),
         jsonb_build_object('treatment', 'Masaje descontracturante', 'completed', v.completed / 4, 'revenue', v.revenue * 0.20))
from (values (28, 268000, 17, 12), (21, 301500, 19, 13), (14, 342000, 22, 13), (7, 389500, 24, 14)) as v(days_ago, revenue, completed, active_patients);

-- ============================================================
-- 8) Historial de exportaciones de stock
-- ============================================================
insert into stock_exports (created_at, low_stock_count, total_supplies, total_value, snapshot)
select now() - make_interval(days => v.days_ago), v.low, 10, v.value,
       (select jsonb_agg(jsonb_build_object('name', s.name, 'currentStock', s.current_stock, 'minStock', s.min_stock, 'unit', s.unit)) from supplies s)
from (values (24, 2, 441000), (17, 3, 452500), (10, 4, 468200), (3, 4, 473400)) as v(days_ago, low, value);

-- ============================================================
-- 9) Consultas del formulario público de Contacto
-- ============================================================
insert into contact_inquiries (created_at, full_name, email, phone, activity_type, reason, message, status) values
  (now() - interval '30 days', 'Valeria Quiroga', 'valeria.quiroga@mail.com', '+54 9 11 5100-1001', 'Centro estético', 'Quiero conocer la plataforma', 'Tengo un centro con 4 profesionales y llevo los turnos en una planilla. Me gustaría ver cómo funciona AURA.', 'Atendida'),
  (now() - interval '24 days', 'Ramiro Costa', 'ramiro.costa@mail.com', '+54 9 351 555-2002', 'Profesional independiente', 'Consulta sobre precios', '¿Hay un plan para una sola profesional? Atiendo en mi consultorio particular.', 'Atendida'),
  (now() - interval '19 days', 'Lorena Bianchi', 'lorena.bianchi@mail.com', '+54 9 341 555-3003', 'Spa', 'Quiero conocer la plataforma', 'Somos un spa con cabinas de masajes y queremos ordenar los insumos y las alertas de stock.', 'Atendida'),
  (now() - interval '13 days', 'Mariano Peña', 'mariano.pena@mail.com', '+54 9 11 5400-4004', 'Centro estético', 'Soporte', 'No puedo recuperar mi contraseña, ¿me pueden ayudar?', 'Atendida'),
  (now() - interval '9 days', 'Julieta Arce', 'julieta.arce@mail.com', '+54 9 261 555-5005', 'Gimnasio / wellness', 'Quiero conocer la plataforma', 'Ofrecemos masajes y tratamientos corporales dentro del gimnasio. ¿Se puede usar para eso?', 'Nueva'),
  (now() - interval '5 days', 'Esteban Roldán', 'esteban.roldan@mail.com', '+54 9 11 5600-6006', 'Centro estético', 'Consulta sobre precios', 'Somos una cadena de 3 sucursales, ¿pueden manejar varios centros?', 'Nueva'),
  (now() - interval '2 days', 'Daniela Fuentes', 'daniela.fuentes@mail.com', '+54 9 11 5700-7007', 'Profesional independiente', 'Otro', 'Quería saber si los recordatorios de turnos se mandan solos por WhatsApp.', 'Nueva');

-- ============================================================
-- 10) Invitaciones de cuenta en distintos estados
--     (usan los roles y profesionales existentes)
-- ============================================================
insert into account_invitations (email, role_id, professional_id, status, created_at, expires_at, used_at)
select v.email, r.id, (select id from professionals where document_id = v.prof_doc), v.status, now() - make_interval(days => v.days_ago), now() - make_interval(days => v.days_ago) + v.validity, v.used_at
from (values
  ('recepcion@wellnest.com', 'Operador', null, 'Pendiente', 2, interval '7 days', null::timestamptz),
  ('damian.castro@aura.com', 'Profesional', '29123321', 'Usada', 12, interval '7 days', now() - interval '11 days'),
  ('nuevo.ingreso@wellnest.com', 'Operador', null, 'Cancelada', 9, interval '7 days', null::timestamptz),
  ('practicas@wellnest.com', 'Profesional', null, 'Pendiente', 20, interval '7 days', null::timestamptz)
) as v(email, role_name, prof_doc, status, days_ago, validity, used_at)
join roles r on r.name = v.role_name;
