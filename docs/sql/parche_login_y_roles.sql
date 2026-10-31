-- Parche Grupo Fénix: login roto y roles de administrador.
-- Correr en Supabase → SQL Editor, en el proyecto que usa Vercel.
-- Revisa primero el select; no corras los updates a ciegas.

-- 1) Diagnóstico: ¿hay tokens en NULL?
select id, email, email_confirmed_at,
       confirmation_token, recovery_token, email_change, email_change_token_new
from auth.users
where email like '%grupofenix.test';

-- 2) Arreglo de tokens NULL (causa conocida de "Database error querying schema"
--    cuando los usuarios se insertaron con SQL directo). Quita las columnas
--    que tu versión de Supabase no tenga.
update auth.users set
  confirmation_token     = coalesce(confirmation_token, ''),
  recovery_token         = coalesce(recovery_token, ''),
  email_change           = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, '')
where email like '%grupofenix.test';

-- 3) Roles: la fuente de verdad es public.user_profiles.role.
--    Ya no se usa raw_user_meta_data para el rol.
update public.user_profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@grupofenix.test');

update public.user_profiles set role = 'instructor'
where id = (select id from auth.users where email = 'instructor@grupofenix.test');

update public.user_profiles set role = 'student'
where id = (select id from auth.users where email = 'alumno@grupofenix.test');

-- 4) Verificación
select u.email, p.role, u.email_confirmed_at is not null as confirmado
from auth.users u
left join public.user_profiles p on p.id = u.id
where u.email like '%grupofenix.test';

-- 5) Enums reales (para confirmar que el formulario de eventos envía valores válidos)
select 'event_category' as enum, unnest(enum_range(null::event_category)) as valor
union all
select 'event_modality', unnest(enum_range(null::event_modality));
