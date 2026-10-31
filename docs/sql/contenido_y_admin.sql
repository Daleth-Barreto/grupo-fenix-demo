-- Contenido real y panel de admin. Correr en Supabase → SQL Editor.
-- Requiere is_admin() e is_admin_or_instructor() del esquema base. Se puede correr más de una vez.
--
-- IMPORTANTE: en Postgres las políticas se suman. Estas abren lo necesario, pero no cierran
-- políticas más amplias que ya existan. Al final hay una consulta para revisarlas.

-- ---------- Acceso a un curso ----------
create or replace function public.has_course_access(target_course uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin_or_instructor() or exists (
    select 1 from public.enrollments e
    where e.course_id = target_course
      and e.user_id = auth.uid()
      and e.status in ('activo', 'completado')
  );
$$;

-- ---------- Un usuario no puede cambiar su propio rol ----------
create or replace function public.protect_user_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_role on public.user_profiles;
create trigger protect_user_role before update on public.user_profiles
  for each row execute function public.protect_user_role();

-- ---------- Todo usuario tiene perfil ----------
-- Sin esta fila, la cuenta no se encuentra y por ejemplo la foto no se puede asignar.
create or replace function public.create_user_profile()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_user_profile on auth.users;
create trigger create_user_profile after insert on auth.users
  for each row execute function public.create_user_profile();

insert into public.user_profiles (id, full_name)
select u.id, u.raw_user_meta_data ->> 'full_name' from auth.users u
on conflict (id) do nothing;

-- ---------- Perfiles ----------
alter table public.user_profiles enable row level security;
drop policy if exists "perfiles: leer" on public.user_profiles;
create policy "perfiles: leer" on public.user_profiles for select to authenticated
  using (id = auth.uid() or public.is_admin_or_instructor());
drop policy if exists "perfiles: crear propio" on public.user_profiles;
create policy "perfiles: crear propio" on public.user_profiles for insert to authenticated
  with check (id = auth.uid() and role = 'student');
drop policy if exists "perfiles: editar" on public.user_profiles;
create policy "perfiles: editar" on public.user_profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ---------- Eventos: públicos para leer ----------
alter table public.events enable row level security;
drop policy if exists "eventos: leer" on public.events;
create policy "eventos: leer" on public.events for select to anon, authenticated using (true);
drop policy if exists "eventos: staff" on public.events;
create policy "eventos: staff" on public.events for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Cursos y contenido: solo inscritos y staff ----------
alter table public.courses enable row level security;
drop policy if exists "cursos: leer" on public.courses;
create policy "cursos: leer" on public.courses for select to authenticated
  using (public.has_course_access(id));
drop policy if exists "cursos: catalogo" on public.courses;
create policy "cursos: catalogo" on public.courses for select to anon, authenticated
  using (published is true);
drop policy if exists "cursos: staff" on public.courses;
create policy "cursos: staff" on public.courses for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

alter table public.modules enable row level security;
drop policy if exists "modulos: leer" on public.modules;
create policy "modulos: leer" on public.modules for select to authenticated
  using (public.has_course_access(course_id));
drop policy if exists "modulos: staff" on public.modules;
create policy "modulos: staff" on public.modules for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

alter table public.lessons enable row level security;
drop policy if exists "lecciones: leer" on public.lessons;
create policy "lecciones: leer" on public.lessons for select to authenticated
  using (exists (select 1 from public.modules m where m.id = module_id and public.has_course_access(m.course_id)));
drop policy if exists "lecciones: staff" on public.lessons;
create policy "lecciones: staff" on public.lessons for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

alter table public.activities enable row level security;
drop policy if exists "actividades: leer" on public.activities;
create policy "actividades: leer" on public.activities for select to authenticated
  using (exists (
    select 1 from public.lessons l join public.modules m on m.id = l.module_id
    where l.id = lesson_id and public.has_course_access(m.course_id)
  ));
drop policy if exists "actividades: staff" on public.activities;
create policy "actividades: staff" on public.activities for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

alter table public.resources enable row level security;
drop policy if exists "recursos: leer" on public.resources;
create policy "recursos: leer" on public.resources for select to authenticated
  using (course_id is not null and public.has_course_access(course_id));
drop policy if exists "recursos: staff" on public.resources;
create policy "recursos: staff" on public.resources for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Inscripciones ----------
alter table public.enrollments enable row level security;
drop policy if exists "inscripciones: leer" on public.enrollments;
create policy "inscripciones: leer" on public.enrollments for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "inscripciones: admin" on public.enrollments;
create policy "inscripciones: admin" on public.enrollments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Órdenes ----------
alter table public.orders enable row level security;
drop policy if exists "ordenes: leer" on public.orders;
create policy "ordenes: leer" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ordenes: crear propia" on public.orders;
create policy "ordenes: crear propia" on public.orders for insert to authenticated
  with check (user_id = auth.uid() and status = 'pendiente');
drop policy if exists "ordenes: admin edita" on public.orders;
create policy "ordenes: admin edita" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Constancias ----------
alter table public.certificates enable row level security;
drop policy if exists "constancias: leer" on public.certificates;
create policy "constancias: leer" on public.certificates for select to authenticated
  using (user_id = auth.uid() or public.is_admin_or_instructor());
drop policy if exists "constancias: staff" on public.certificates;
create policy "constancias: staff" on public.certificates for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Transmisiones ----------
alter table public.lives enable row level security;
drop policy if exists "transmisiones: leer" on public.lives;
create policy "transmisiones: leer" on public.lives for select to authenticated using (true);
drop policy if exists "transmisiones: staff" on public.lives;
create policy "transmisiones: staff" on public.lives for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Medios ----------
alter table public.media enable row level security;
drop policy if exists "medios: staff" on public.media;
create policy "medios: staff" on public.media for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 20971520)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "media: subir staff" on storage.objects;
create policy "media: subir staff" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin_or_instructor());
drop policy if exists "media: borrar staff" on storage.objects;
create policy "media: borrar staff" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin_or_instructor());

-- ---------- Solicitudes: el admin también puede borrarlas ----------
drop policy if exists "reservaciones: admin borra" on public.reservation_requests;
create policy "reservaciones: admin borra" on public.reservation_requests for delete to authenticated
  using (public.is_admin());

-- ---------- Carga inicial: los eventos que antes estaban fijos en el código ----------
-- Solo corre si la tabla está vacía. Confirma fechas y precios en el panel.
insert into public.events (title, description, category, modality, start_date, end_date, location, price, hours, featured, cover_image)
select * from (values
  ('1er. Congreso Internacional de Neurodesarrollo y Neuroeducación', 'Encuentro internacional sobre los últimos avances en neurodesarrollo y su aplicación en la neuroeducación, con especialistas de talla mundial.', 'congreso'::public.event_category, 'presencial'::public.event_modality, date '2026-12-04', date '2026-12-07', 'Puebla, Puebla', 2500::numeric, 32, true, '/events/neurodesarrollo.jpeg'),
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Tercera edición del congreso nacional dedicado a la sexualidad y la psicoterapia de pareja, con enfoque clínico, ético y vivencial.', 'congreso', 'presencial', date '2026-11-12', date '2026-11-15', 'San Cristóbal de las Casas, Chiapas', 2300, 30, false, '/events/sexualidad.jpg'),
  ('2do. Congreso Nacional de Tanatología', 'Segunda edición del congreso nacional de tanatología, centrado en el acompañamiento del duelo y los cuidados al final de la vida.', 'congreso', 'hibrido', date '2027-03-18', date '2027-03-21', 'Guadalajara, Jalisco', 2400, 32, false, '/events/tanatologia.png'),
  ('1er. Congreso Nacional de Psicooncología', 'Primer congreso nacional de psicooncología: abordaje psicológico integral del paciente oncológico y su familia.', 'congreso', 'hibrido', date '2027-03-18', date '2027-03-21', 'Guadalajara, Jalisco', 2200, 30, false, '/events/psicooncologia.png'),
  ('Capacitación: Primeros Auxilios Psicológicos', 'Programa intensivo con valor curricular para la intervención en crisis y la contención emocional.', 'capacitacion', 'en_linea', date '2026-09-05', date '2026-09-06', 'En línea', 950, 12, false, null),
  ('Taller de Intervención en Duelo', 'Herramientas prácticas para el acompañamiento terapéutico de procesos de duelo complejo.', 'taller', 'presencial', date '2026-08-18', date '2026-08-18', 'Ciudad de México', 700, null, false, null)
) as seed(title, description, category, modality, start_date, end_date, location, price, hours, featured, cover_image)
where not exists (select 1 from public.events);

-- ---------- Revisión: copia este resultado y compártelo con quien mantiene la app ----------
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
