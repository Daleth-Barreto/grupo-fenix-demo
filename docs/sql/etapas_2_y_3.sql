-- Agenda, preguntas, encuestas, cuestionarios, avance de video y constancias por asistencia.
-- Correr en Supabase → SQL Editor, después de boletos_y_asistencia.sql. Se puede correr más de una vez.

-- ---------- ¿Tiene acceso a este evento? ----------
create or replace function public.has_event_access(p_event uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin_or_instructor() or exists (
    select 1 from public.enrollments e
    where e.event_id = p_event
      and e.user_id = auth.uid()
      and e.status in ('activo', 'completado')
  );
$$;

-- ---------- Agenda: pública para que se pueda consultar antes de inscribirse ----------
create table if not exists public.event_sessions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  title        text not null,
  description  text,
  speaker_name text,
  speaker_bio  text,
  room         text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists event_sessions_event_idx on public.event_sessions (event_id, starts_at);

alter table public.event_sessions enable row level security;
drop policy if exists "sesiones: leer" on public.event_sessions;
create policy "sesiones: leer" on public.event_sessions for select to anon, authenticated using (true);
drop policy if exists "sesiones: staff" on public.event_sessions;
create policy "sesiones: staff" on public.event_sessions for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Materiales y grabaciones: solo inscritos ----------
create table if not exists public.session_materials (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.event_sessions(id) on delete cascade,
  title      text not null,
  url        text not null,
  kind       text not null default 'material' check (kind in ('material', 'grabacion')),
  created_at timestamptz not null default now()
);
create index if not exists session_materials_session_idx on public.session_materials (session_id);

alter table public.session_materials enable row level security;
drop policy if exists "materiales: leer" on public.session_materials;
create policy "materiales: leer" on public.session_materials for select to authenticated
  using (exists (select 1 from public.event_sessions s where s.id = session_id and public.has_event_access(s.event_id)));
drop policy if exists "materiales: staff" on public.session_materials;
create policy "materiales: staff" on public.session_materials for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- ---------- Mi agenda ----------
create table if not exists public.session_favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.event_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

alter table public.session_favorites enable row level security;
drop policy if exists "favoritos: propios" on public.session_favorites;
create policy "favoritos: propios" on public.session_favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Preguntas en sesión ----------
create table if not exists public.session_questions (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.event_sessions(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 500),
  answered    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists session_questions_session_idx on public.session_questions (session_id, created_at);

alter table public.session_questions enable row level security;
drop policy if exists "preguntas: leer" on public.session_questions;
create policy "preguntas: leer" on public.session_questions for select to authenticated
  using (exists (select 1 from public.event_sessions s where s.id = session_id and public.has_event_access(s.event_id)));
drop policy if exists "preguntas: crear" on public.session_questions;
create policy "preguntas: crear" on public.session_questions for insert to authenticated
  with check (user_id = auth.uid() and answered = false
    and exists (select 1 from public.event_sessions s where s.id = session_id and public.has_event_access(s.event_id)));
drop policy if exists "preguntas: staff edita" on public.session_questions;
create policy "preguntas: staff edita" on public.session_questions for update to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());
drop policy if exists "preguntas: borrar" on public.session_questions;
create policy "preguntas: borrar" on public.session_questions for delete to authenticated
  using (user_id = auth.uid() or public.is_admin_or_instructor());

-- ---------- Encuestas ----------
create table if not exists public.session_polls (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.event_sessions(id) on delete cascade,
  question   text not null,
  options    text[] not null check (cardinality(options) between 2 and 10),
  is_open    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists session_polls_session_idx on public.session_polls (session_id);

alter table public.session_polls enable row level security;
drop policy if exists "encuestas: leer" on public.session_polls;
create policy "encuestas: leer" on public.session_polls for select to authenticated
  using (exists (select 1 from public.event_sessions s where s.id = session_id and public.has_event_access(s.event_id)));
drop policy if exists "encuestas: staff" on public.session_polls;
create policy "encuestas: staff" on public.session_polls for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

-- Un voto por persona. Solo se escribe con vote_poll, que revisa acceso y que siga abierta.
create table if not exists public.poll_votes (
  poll_id      uuid not null references public.session_polls(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  option_index int not null,
  created_at   timestamptz not null default now(),
  primary key (poll_id, user_id)
);
alter table public.poll_votes enable row level security;
drop policy if exists "votos: propios" on public.poll_votes;
create policy "votos: propios" on public.poll_votes for select to authenticated using (user_id = auth.uid());

create or replace function public.vote_poll(p_poll uuid, p_option int)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_poll public.session_polls%rowtype;
  v_event uuid;
begin
  if auth.uid() is null then
    raise exception 'Sin sesión' using errcode = '42501';
  end if;
  select * into v_poll from public.session_polls where id = p_poll;
  if not found then
    return jsonb_build_object('status', 'no_existe');
  end if;
  select event_id into v_event from public.event_sessions where id = v_poll.session_id;
  if not public.has_event_access(v_event) then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  if not v_poll.is_open then
    return jsonb_build_object('status', 'cerrada');
  end if;
  if p_option < 0 or p_option >= cardinality(v_poll.options) then
    return jsonb_build_object('status', 'opcion_invalida');
  end if;
  insert into public.poll_votes (poll_id, user_id, option_index)
  values (p_poll, auth.uid(), p_option)
  on conflict (poll_id, user_id) do update set option_index = excluded.option_index;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Totales por opción, sin revelar quién votó qué.
create or replace function public.poll_results(p_session uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_event uuid;
begin
  select event_id into v_event from public.event_sessions where id = p_session;
  if v_event is null or not public.has_event_access(v_event) then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id,
      'question', p.question,
      'options', to_jsonb(p.options),
      'is_open', p.is_open,
      'my_vote', (select v.option_index from public.poll_votes v where v.poll_id = p.id and v.user_id = auth.uid()),
      'totals', (select coalesce(jsonb_object_agg(t.option_index, t.n), '{}'::jsonb)
                 from (select option_index, count(*) n from public.poll_votes v where v.poll_id = p.id group by option_index) t)
    ) order by p.created_at)
    from public.session_polls p where p.session_id = p_session
  ), '[]'::jsonb);
end;
$$;

-- ---------- Cuestionarios ----------
-- Solo el staff lee esta tabla: el alumno recibe las preguntas sin la respuesta correcta.
create table if not exists public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  prompt        text not null,
  options       text[] not null check (cardinality(options) between 2 and 10),
  correct_index int not null,
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  check (correct_index >= 0 and correct_index < cardinality(options))
);
create index if not exists quiz_questions_lesson_idx on public.quiz_questions (lesson_id, position);

alter table public.quiz_questions enable row level security;
drop policy if exists "cuestionario: staff" on public.quiz_questions;
create policy "cuestionario: staff" on public.quiz_questions for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

create table if not exists public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  score      int not null,
  total      int not null,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_lesson_idx on public.quiz_attempts (user_id, lesson_id, created_at desc);

alter table public.quiz_attempts enable row level security;
drop policy if exists "intentos: leer" on public.quiz_attempts;
create policy "intentos: leer" on public.quiz_attempts for select to authenticated
  using (user_id = auth.uid() or public.is_admin_or_instructor());

create or replace function public.lesson_course(p_lesson uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select m.course_id from public.lessons l join public.modules m on m.id = l.module_id where l.id = p_lesson;
$$;

create or replace function public.get_quiz(p_lesson uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.has_course_access(public.lesson_course(p_lesson)) then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object('id', q.id, 'prompt', q.prompt, 'options', to_jsonb(q.options)) order by q.position, q.created_at)
      from public.quiz_questions q where q.lesson_id = p_lesson
    ), '[]'::jsonb),
    'best', (select max(a.score) from public.quiz_attempts a where a.lesson_id = p_lesson and a.user_id = auth.uid()),
    'attempts', (select count(*) from public.quiz_attempts a where a.lesson_id = p_lesson and a.user_id = auth.uid())
  );
end;
$$;

-- La calificación se calcula aquí: el navegador nunca conoce las respuestas correctas.
create or replace function public.submit_quiz(p_lesson uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_total int;
  v_score int;
begin
  if not public.has_course_access(public.lesson_course(p_lesson)) then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  select count(*), count(*) filter (where (p_answers ->> q.id::text)::int = q.correct_index)
  into v_total, v_score
  from public.quiz_questions q where q.lesson_id = p_lesson;
  if v_total = 0 then
    return jsonb_build_object('status', 'sin_preguntas');
  end if;
  insert into public.quiz_attempts (user_id, lesson_id, score, total) values (auth.uid(), p_lesson, v_score, v_total);
  return jsonb_build_object('status', 'ok', 'score', v_score, 'total', v_total);
exception when invalid_text_representation then
  return jsonb_build_object('status', 'respuestas_invalidas');
end;
$$;

-- ---------- Continuar donde se quedó ----------
create table if not exists public.lesson_positions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  seconds    int not null default 0 check (seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_positions enable row level security;
drop policy if exists "avance: propio" on public.lesson_positions;
create policy "avance: propio" on public.lesson_positions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Constancias ----------
create unique index if not exists certificates_number_key on public.certificates (certificate_number);

-- Verificación pública: entrega solo lo necesario para validar un folio.
create or replace function public.verify_certificate(p_folio text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce((
    select jsonb_build_object(
      'valid', true,
      'folio', c.certificate_number,
      'name', p.full_name,
      'title', coalesce(e.title, cu.title),
      'hours', e.hours,
      'issued_at', c.issued_at
    )
    from public.certificates c
    left join public.user_profiles p on p.id = c.user_id
    left join public.events e on e.id = c.event_id
    left join public.courses cu on cu.id = c.course_id
    where upper(c.certificate_number) = upper(trim(p_folio)) and c.issued_at is not null
    limit 1
  ), jsonb_build_object('valid', false));
$$;

-- Emite constancias a quienes alcanzaron el porcentaje de días con entrada registrada.
create or replace function public.issue_event_certificates(p_event uuid, p_min_percent int)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_days int;
  v_event public.events%rowtype;
  v_created int;
begin
  if not public.is_admin() then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  if p_min_percent < 1 or p_min_percent > 100 then
    return jsonb_build_object('status', 'porcentaje_invalido');
  end if;
  select * into v_event from public.events where id = p_event;
  if not found or v_event.start_date is null then
    return jsonb_build_object('status', 'evento_invalido');
  end if;
  v_days := coalesce(v_event.end_date, v_event.start_date)::date - v_event.start_date::date + 1;

  with eligible as (
    select e.user_id
    from public.enrollments e
    join public.checkins c on c.enrollment_id = e.id
    where e.event_id = p_event and e.status in ('activo', 'completado') and e.user_id is not null
    group by e.user_id
    having count(distinct c.check_in_date) * 100 >= p_min_percent * v_days
  ), created as (
    insert into public.certificates (user_id, event_id, certificate_number, issued_at)
    select g.user_id, p_event,
           'GF-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
           now()
    from eligible g
    where not exists (select 1 from public.certificates x where x.user_id = g.user_id and x.event_id = p_event)
    returning 1
  )
  select count(*) into v_created from created;

  return jsonb_build_object('status', 'ok', 'created', v_created, 'event_days', v_days);
end;
$$;

-- ---------- Permisos de las funciones ----------
revoke all on function public.has_event_access(uuid) from public, anon;
revoke all on function public.vote_poll(uuid, int) from public, anon;
revoke all on function public.poll_results(uuid) from public, anon;
revoke all on function public.lesson_course(uuid) from public, anon;
revoke all on function public.get_quiz(uuid) from public, anon;
revoke all on function public.submit_quiz(uuid, jsonb) from public, anon;
revoke all on function public.issue_event_certificates(uuid, int) from public, anon;
grant execute on function public.has_event_access(uuid) to authenticated;
grant execute on function public.vote_poll(uuid, int) to authenticated;
grant execute on function public.poll_results(uuid) to authenticated;
grant execute on function public.lesson_course(uuid) to authenticated;
grant execute on function public.get_quiz(uuid) to authenticated;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
grant execute on function public.issue_event_certificates(uuid, int) to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
