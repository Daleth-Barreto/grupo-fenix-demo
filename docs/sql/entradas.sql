-- Tipos de entrada por evento, con los precios de eventosgrupofenix.com al 31 de octubre de 2026.
-- Correr en Supabase → SQL Editor. Se puede correr más de una vez.

create table if not exists public.event_tickets (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        text not null,
  kind        text not null default 'admision' check (kind in ('reservacion', 'admision', 'hospedaje')),
  description text,
  includes    text[] not null default '{}',
  price       numeric(10, 2) not null check (price >= 0),
  position    int not null default 0,
  sold_out    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (event_id, name)
);
create index if not exists event_tickets_event_idx on public.event_tickets (event_id, position);

alter table public.event_tickets enable row level security;
drop policy if exists "entradas: leer" on public.event_tickets;
create policy "entradas: leer" on public.event_tickets for select to anon, authenticated using (true);
drop policy if exists "entradas: staff" on public.event_tickets;
create policy "entradas: staff" on public.event_tickets for all to authenticated
  using (public.is_admin_or_instructor()) with check (public.is_admin_or_instructor());

with entradas (titulo, name, kind, description, includes, price, position, sold_out) as (
  values
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Reservación', 'reservacion', 'Primer pago para reservar tu lugar. Después de pagar, te contactamos para completar tu inscripción.', array[]::text[], 500, 1, false),
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Solo admisión', 'admision', null, array['Kit de bienvenida','Coffee break','Acceso a todas las conferencias','3 talleres (cupo limitado)','Material de trabajo','Constancia general del evento','Constancia por taller con valor curricular ante SEP CONOCER','Atención personalizada'], 2150, 2, false),
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Con hospedaje: habitación sencilla', 'hospedaje', 'Hospedaje de 4 días y 3 noches.', array['Todo lo incluido en la admisión'], 6300, 3, false),
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Con hospedaje: habitación doble', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 5300, 4, false),
  ('3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja', 'Con hospedaje: habitación cuádruple', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 4300, 5, false),
  ('2do. Congreso Nacional de Tanatología', 'Reservación', 'reservacion', 'Primer pago para reservar tu lugar. Después de pagar, te contactamos para completar tu inscripción.', array[]::text[], 500, 1, false),
  ('2do. Congreso Nacional de Tanatología', 'Solo admisión', 'admision', null, array['Coffee break','Kit de bienvenida','Material de trabajo','Acceso a todas las conferencias','3 talleres (cupo limitado)','Constancia general del congreso con valor curricular','Constancia individual por taller con valor curricular','Atención personalizada'], 2250, 2, false),
  ('2do. Congreso Nacional de Tanatología', 'Con hospedaje: habitación sencilla', 'hospedaje', 'Hospedaje de 4 días y 3 noches.', array['Todo lo incluido en la admisión'], 7500, 3, true),
  ('2do. Congreso Nacional de Tanatología', 'Con hospedaje: habitación doble', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 6500, 4, false),
  ('2do. Congreso Nacional de Tanatología', 'Con hospedaje: habitación triple', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 5500, 5, false),
  ('1er. Congreso Nacional de Psicooncología', 'Reservación', 'reservacion', 'Primer pago para reservar tu lugar. Después de pagar, te contactamos para completar tu inscripción.', array[]::text[], 500, 1, false),
  ('1er. Congreso Nacional de Psicooncología', 'Solo admisión', 'admision', null, array['Coffee break','Kit de bienvenida','Material de trabajo','Acceso a todas las conferencias','3 talleres (cupo limitado)','Constancia general del congreso con valor curricular','Constancia individual por taller con valor curricular','Atención personalizada'], 2250, 2, false),
  ('1er. Congreso Nacional de Psicooncología', 'Con hospedaje: habitación sencilla', 'hospedaje', 'Hospedaje de 4 días y 3 noches.', array['Todo lo incluido en la admisión'], 7500, 3, true),
  ('1er. Congreso Nacional de Psicooncología', 'Con hospedaje: habitación doble', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 6500, 4, false),
  ('1er. Congreso Nacional de Psicooncología', 'Con hospedaje: habitación triple', 'hospedaje', 'Hospedaje de 4 días y 3 noches. Precio por persona.', array['Todo lo incluido en la admisión'], 5500, 5, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'Zona Luneta', 'admision', null, array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 750, 1, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'Zona Luneta Central', 'admision', null, array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 850, 2, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'Preferente', 'admision', null, array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 950, 3, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'VIP', 'admision', null, array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 1250, 4, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'Gran VIP', 'admision', null, array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 1650, 5, false),
  ('1er. Encuentro Internacional Universitario de Psicología', 'Paquete estudiantes: hospedaje + acceso', 'hospedaje', 'Hospedaje de 4 días y 3 noches en habitación cuádruple, con desayuno americano tipo buffet.', array['Acceso a todas las conferencias','Kit de bienvenida','Material de trabajo','Constancia general del encuentro con valor curricular','Atención personalizada'], 2899, 6, false)
)
insert into public.event_tickets (event_id, name, kind, description, includes, price, position, sold_out)
select e.id, t.name, t.kind, t.description, t.includes, t.price, t.position, t.sold_out
from entradas t
join public.events e on e.title = t.titulo
on conflict (event_id, name) do update set
  kind = excluded.kind, description = excluded.description, includes = excluded.includes,
  price = excluded.price, position = excluded.position, sold_out = excluded.sold_out;
