-- Progreso de lecciones por usuario.
-- Correr en Supabase → SQL Editor, en el proyecto que usa Vercel.
-- course_id y lesson_id son texto porque hoy los cursos y lecciones vienen de src/data/mock.ts.

create table if not exists public.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    text not null,
  lesson_id    text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

-- Cada usuario solo ve y modifica su propio progreso.
-- Las rutas /api/progress usan la service_role (que ignora RLS), pero estas
-- políticas protegen el acceso si alguna vez se consulta directo desde el cliente.
create policy "progreso: leer propio" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "progreso: insertar propio" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "progreso: borrar propio" on public.user_progress
  for delete using (auth.uid() = user_id);
