-- AURA — marca si el administrador ya completó la "Configuración inicial"
-- (pantallas Configuración inicial y Bienvenida). Correr una sola vez en el SQL Editor.
alter table workspace add column if not exists setup_completed boolean not null default false;
