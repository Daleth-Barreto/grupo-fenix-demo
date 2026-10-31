-- Boletos con QR y registro de entrada. Correr en Supabase → SQL Editor,
-- después de contenido_y_admin.sql. Se puede correr más de una vez.

-- El QR lleva solo este código: no incluye datos personales.
alter table public.enrollments add column if not exists ticket_code uuid not null default gen_random_uuid();
create unique index if not exists enrollments_ticket_code_key on public.enrollments (ticket_code);

-- Una fila por persona y por día: un congreso de varios días cuenta cada asistencia.
create table if not exists public.checkins (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  event_id      uuid not null references public.events(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  check_in_date date not null,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references auth.users(id) on delete set null,
  unique (enrollment_id, check_in_date)
);
create index if not exists checkins_event_date_idx on public.checkins (event_id, check_in_date);

-- Sin políticas de escritura: solo se registra con las funciones de abajo.
alter table public.checkins enable row level security;
drop policy if exists "asistencia: leer" on public.checkins;
create policy "asistencia: leer" on public.checkins for select to authenticated
  using (user_id = auth.uid() or public.is_admin_or_instructor());

-- Registra la entrada por código de QR o por inscripción. La fecha es la de México.
create or replace function public.check_in_attendee(p_event uuid, p_code uuid default null, p_enrollment uuid default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_enrollment public.enrollments%rowtype;
  v_event public.events%rowtype;
  v_name text;
  v_today date := (now() at time zone 'America/Mexico_City')::date;
  v_at timestamptz;
begin
  if not public.is_admin_or_instructor() then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;

  select * into v_enrollment from public.enrollments
  where (p_code is not null and ticket_code = p_code)
     or (p_code is null and p_enrollment is not null and id = p_enrollment);
  if not found then
    return jsonb_build_object('status', 'invalido');
  end if;

  select full_name into v_name from public.user_profiles where id = v_enrollment.user_id;

  if v_enrollment.event_id is distinct from p_event then
    return jsonb_build_object('status', 'otro_evento', 'name', v_name);
  end if;
  if v_enrollment.status not in ('activo', 'completado') then
    return jsonb_build_object('status', 'cancelado', 'name', v_name);
  end if;

  select * into v_event from public.events where id = p_event;
  if v_today < v_event.start_date::date or v_today > coalesce(v_event.end_date, v_event.start_date)::date then
    return jsonb_build_object('status', 'fuera_de_fecha', 'name', v_name);
  end if;

  insert into public.checkins (enrollment_id, event_id, user_id, check_in_date, checked_in_by)
  values (v_enrollment.id, p_event, v_enrollment.user_id, v_today, auth.uid())
  on conflict (enrollment_id, check_in_date) do nothing
  returning checked_in_at into v_at;

  if v_at is null then
    select checked_in_at into v_at from public.checkins
    where enrollment_id = v_enrollment.id and check_in_date = v_today;
    return jsonb_build_object('status', 'repetido', 'name', v_name, 'checked_in_at', v_at);
  end if;
  return jsonb_build_object('status', 'ok', 'name', v_name, 'checked_in_at', v_at);
end;
$$;

-- Lista para buscar por nombre, con los totales del día.
create or replace function public.event_attendance(p_event uuid, p_term text default '')
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/Mexico_City')::date;
begin
  if not public.is_admin_or_instructor() then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'enrolled', (select count(*) from public.enrollments
                 where event_id = p_event and status in ('activo', 'completado')),
    'present_today', (select count(*) from public.checkins
                      where event_id = p_event and check_in_date = v_today),
    'attendees', coalesce((
      select jsonb_agg(row_to_json(a)) from (
        select e.id as enrollment_id,
               p.full_name,
               exists (select 1 from public.checkins c where c.enrollment_id = e.id and c.check_in_date = v_today) as present_today,
               (select count(*) from public.checkins c where c.enrollment_id = e.id) as days_attended
        from public.enrollments e
        left join public.user_profiles p on p.id = e.user_id
        where e.event_id = p_event
          and e.status in ('activo', 'completado')
          and (coalesce(p_term, '') = '' or position(lower(p_term) in lower(coalesce(p.full_name, ''))) > 0)
        order by p.full_name nulls last
        limit 50
      ) a
    ), '[]'::jsonb)
  );
end;
$$;

-- Corrige un registro hecho por error: solo el del día.
create or replace function public.undo_check_in(p_enrollment uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin_or_instructor() then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  delete from public.checkins
  where enrollment_id = p_enrollment
    and check_in_date = (now() at time zone 'America/Mexico_City')::date;
  return found;
end;
$$;

revoke all on function public.check_in_attendee(uuid, uuid, uuid) from public, anon;
revoke all on function public.event_attendance(uuid, text) from public, anon;
revoke all on function public.undo_check_in(uuid) from public, anon;
grant execute on function public.check_in_attendee(uuid, uuid, uuid) to authenticated;
grant execute on function public.event_attendance(uuid, text) to authenticated;
grant execute on function public.undo_check_in(uuid) to authenticated;
