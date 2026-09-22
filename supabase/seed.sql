-- AURA — datos de ejemplo (seed) para Supabase
-- Correr DESPUES de schema.sql, en el mismo SQL Editor

insert into patients (id, first_name, last_name, document_id, birth_date, phone, email, address, registered_at, status) overriding system value values
  (1, 'Camila', 'Pérez', '34521678', '1994-03-12', '+54 9 11 4455-1122', 'camila.perez@mail.com', 'Av. Corrientes 2345, CABA', '2024-02-10', 'Activo'),
  (2, 'Ana', 'Torres', '31245789', '1990-07-05', '+54 9 11 5566-2233', 'ana.torres@mail.com', 'San Martín 890, CABA', '2024-04-22', 'Activo'),
  (3, 'Lucía', 'Fernández', '39876543', '1998-11-30', '+54 9 11 3344-9988', 'lucia.fernandez@mail.com', 'Rivadavia 1200, CABA', '2024-06-01', 'Activo'),
  (4, 'Carla', 'Gómez', '28765432', '1985-01-18', '+54 9 11 2233-4455', 'carla.gomez@mail.com', 'Av. Cabildo 3400, CABA', '2023-09-15', 'Inactivo'),
  (5, 'Sofía', 'Martínez', '40123456', '2000-05-22', '+54 9 11 6677-8899', 'sofia.martinez@mail.com', 'Av. Santa Fe 4500, CABA', '2024-07-19', 'Activo'),
  (6, 'Valentina', 'Ruiz', '36789123', '1996-09-08', '+54 9 11 7788-1234', 'valentina.ruiz@mail.com', 'Warnes 900, CABA', '2024-01-05', 'Activo'),
  (7, 'Julieta', 'Sosa', '33456789', '1992-12-02', '+54 9 11 8899-2211', 'julieta.sosa@mail.com', 'Av. Belgrano 1500, CABA', '2023-11-28', 'Activo'),
  (8, 'Martina', 'Díaz', '38912345', '1999-04-14', '+54 9 11 9900-3344', 'martina.diaz@mail.com', 'Directorio 2100, CABA', '2024-05-03', 'Activo'),
  (9, 'Florencia', 'Acosta', '29876123', '1988-08-27', '+54 9 11 1122-5566', 'florencia.acosta@mail.com', 'Av. Rivadavia 8900, CABA', '2023-06-11', 'Inactivo'),
  (10, 'Agustina', 'Molina', '37654321', '1997-02-19', '+54 9 11 3322-6677', 'agustina.molina@mail.com', 'Av. Juan B. Justo 2300, CABA', '2024-08-01', 'Activo');

insert into professionals (id, first_name, last_name, document_id, license_number, phone, email, specialty, status) overriding system value values
  (1, 'María', 'López', '27123456', 'MP-4521', '+54 9 11 4411-2233', 'maria.lopez@aura.com', 'Cosmetología', 'Activo'),
  (2, 'Laura', 'García', '30456789', 'MP-5892', '+54 9 11 5522-3344', 'laura.garcia@aura.com', 'Depilación', 'Activo'),
  (3, 'Rocío', 'Fernández', '32987654', 'MP-6123', '+54 9 11 6633-4455', 'rocio.fernandez@aura.com', 'Masoterapia', 'Activo'),
  (4, 'Damián', 'Castro', '29123321', 'MP-3987', '+54 9 11 7744-5566', 'damian.castro@aura.com', 'Tratamientos corporales', 'Activo'),
  (5, 'Paula', 'Ibáñez', '31654987', 'MP-7345', '+54 9 11 8855-6677', 'paula.ibanez@aura.com', 'Tratamientos faciales', 'Inactivo');

insert into treatments (id, name, description, duration_minutes, price, category, status) overriding system value values
  (1, 'Limpieza facial profunda', 'Limpieza con extracción e hidratación final.', 60, 18000, 'Facial', 'Activo'),
  (2, 'Peeling químico', 'Renovación celular con ácidos suaves.', 45, 22000, 'Facial', 'Activo'),
  (3, 'Depilación láser - Piernas', 'Sesión de depilación definitiva en piernas completas.', 40, 15000, 'Depilación', 'Activo'),
  (4, 'Masaje descontracturante', 'Masaje terapéutico de espalda y cuello.', 50, 16000, 'Corporal', 'Activo'),
  (5, 'Drenaje linfático', 'Masaje corporal para reducir retención de líquidos.', 60, 17500, 'Corporal', 'Activo'),
  (6, 'Radiofrecuencia facial', 'Tratamiento reafirmante con radiofrecuencia.', 30, 21000, 'Facial', 'Inactivo');

insert into supplies (id, name, description, current_stock, min_stock, unit, category, price, status) overriding system value values
  (1, 'Crema hidratante facial', 'Uso en limpiezas e hidrataciones.', 18, 10, 'unidades', 'Cremas', 4200, 'Activo'),
  (2, 'Guantes de nitrilo (caja x100)', 'Descartables, uso general.', 4, 6, 'cajas', 'Descartables', 8500, 'Activo'),
  (3, 'Gasas estériles', 'Uso en tratamientos faciales y corporales.', 25, 15, 'paquetes', 'Descartables', 1200, 'Activo'),
  (4, 'Ácido glicólico 20%', 'Insumo para peeling químico.', 3, 5, 'frascos', 'Productos activos', 6800, 'Activo'),
  (5, 'Cera depilatoria', 'Uso en sesiones de depilación.', 12, 8, 'kg', 'Depilación', 5400, 'Activo'),
  (6, 'Aceite para masajes', 'Uso en masajes y drenajes.', 9, 10, 'litros', 'Corporal', 3900, 'Activo'),
  (7, 'Alcohol en gel', 'Higiene general del centro.', 30, 12, 'litros', 'Higiene', 2100, 'Activo'),
  (8, 'Bandas descartables cabello', 'Uso en tratamientos faciales.', 2, 10, 'unidades', 'Descartables', 800, 'Activo'),
  (9, 'Crema reafirmante corporal', 'Uso en tratamientos corporales.', 14, 8, 'unidades', 'Cremas', 5600, 'Activo'),
  (10, 'Protector solar FPS50', 'Aplicación posterior a tratamientos faciales.', 7, 10, 'unidades', 'Cremas', 4700, 'Activo');

insert into treatment_supplies (id, treatment_id, supply_id, quantity) overriding system value values
  (1, 1, 1, 1),
  (2, 1, 3, 2),
  (3, 2, 4, 1),
  (4, 2, 10, 1),
  (5, 3, 5, 1),
  (6, 4, 6, 1),
  (7, 5, 6, 1),
  (8, 1, 8, 1);

-- Reacomoda los contadores de autoincremento para que las próximas altas no choquen con estos ids
select setval(pg_get_serial_sequence('patients', 'id'), (select max(id) from patients));
select setval(pg_get_serial_sequence('professionals', 'id'), (select max(id) from professionals));
select setval(pg_get_serial_sequence('treatments', 'id'), (select max(id) from treatments));
select setval(pg_get_serial_sequence('supplies', 'id'), (select max(id) from supplies));
select setval(pg_get_serial_sequence('treatment_supplies', 'id'), (select max(id) from treatment_supplies));
