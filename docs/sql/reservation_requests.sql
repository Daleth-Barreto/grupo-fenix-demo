-- Solicitudes de cotización enviadas desde /app/reservaciones.
-- Correr en Supabase → SQL Editor.

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

-- Sin políticas: solo el servidor (service_role) puede leer y escribir.
alter table public.reservation_requests enable row level security;
