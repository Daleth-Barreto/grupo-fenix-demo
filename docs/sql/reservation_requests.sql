-- Solicitudes de cotización enviadas desde /app/reservaciones.
-- Correr en Supabase → SQL Editor. Usa is_admin() del esquema base.

create table if not exists public.reservation_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  interest     text not null,
  name         text not null,
  email        text not null,
  phone        text not null,
  organization text,
  message      text,
  created_at   timestamptz not null default now()
);

alter table public.reservation_requests enable row level security;

drop policy if exists "reservaciones: crear propia" on public.reservation_requests;
create policy "reservaciones: crear propia" on public.reservation_requests
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "reservaciones: admin lee" on public.reservation_requests;
create policy "reservaciones: admin lee" on public.reservation_requests
  for select to authenticated using (public.is_admin());
