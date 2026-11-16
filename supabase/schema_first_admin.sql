-- AURA — La primera cuenta que se registra queda como Administrador activo.
-- Permite que el responsable del negocio cree su cuenta desde la pantalla pública
-- "Crear cuenta" y siga con la Configuración inicial. Las cuentas siguientes
-- (sin invitación) quedan inactivas hasta que un administrador las habilite.
-- Ejecutar después de schema_week9_to_11.sql. Es seguro volver a correrlo.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation account_invitations%rowtype;
  first_admin boolean;
begin
  select * into invitation
  from account_invitations
  where token::text = new.raw_user_meta_data ->> 'invitation_token'
    and lower(email) = lower(new.email)
    and status = 'Pendiente'
    and expires_at > now();

  -- ¿Todavía no existe ningún administrador? Entonces esta cuenta lo será.
  select not exists (
    select 1 from profiles p join roles r on r.id = p.role_id where r.name = 'Administrador'
  ) into first_admin;

  insert into profiles (id, first_name, last_name, email, username, role_id, professional_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'username',
    case
      when invitation.id is not null then invitation.role_id
      when first_admin then (select id from roles where name = 'Administrador')
      else (select id from roles where name = 'Operador')
    end,
    invitation.professional_id,
    case when invitation.id is not null or first_admin then 'Activo' else 'Inactivo' end
  );

  if invitation.id is not null then
    update account_invitations set status = 'Usada', used_at = now() where id = invitation.id;
  end if;

  return new;
end;
$$;
