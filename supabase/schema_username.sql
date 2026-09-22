-- AURA — agrega login por nombre de usuario (además de email)
-- Correr en el SQL Editor de Supabase, después de los scripts anteriores

-- 1) Columna nueva en profiles
alter table profiles add column username text unique;

-- 2) El trigger de alta de cuenta ahora también guarda el username
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'username'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3) Función pública para resolver "username -> email" ANTES de loguearse
-- (el usuario todavía no está autenticado en ese momento, por eso no puede
-- leer la tabla profiles directamente; esta función es la única puerta,
-- y solo devuelve el email, nada más).
create or replace function public.get_email_by_username(lookup_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from profiles where username = lookup_username limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;
