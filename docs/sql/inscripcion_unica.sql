-- Una persona solo puede tener una inscripción por curso y una por evento.
-- Protege contra el doble cobro: si llegan dos avisos de pago de Stripe al mismo tiempo,
-- la base rechaza la segunda inscripción (error 23505) y la app la toma como "ya inscrito".
-- Antes de correrlo, revisar que no haya duplicados (la consulta de abajo debe salir vacía):
--
--   select user_id, course_id, count(*) from enrollments where course_id is not null group by 1, 2 having count(*) > 1;
--   select user_id, event_id,  count(*) from enrollments where event_id  is not null group by 1, 2 having count(*) > 1;

create unique index if not exists enrollments_usuario_curso_unico
  on public.enrollments (user_id, course_id)
  where course_id is not null;

create unique index if not exists enrollments_usuario_evento_unico
  on public.enrollments (user_id, event_id)
  where event_id is not null;
