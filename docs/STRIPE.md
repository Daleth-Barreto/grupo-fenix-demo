# Configurar Stripe en Grupo Fénix

Guía para dejar listos los pagos. Las llaves **nunca** van en el código ni en el repositorio: solo en Vercel.

## 1. Llaves en Vercel

Vercel → proyecto `grupo-fenix-demo` → Settings → Environment Variables. Para cada una, marca **Production** y **Preview**.

| Variable | De dónde sale | Para qué |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → *Secret key* (`sk_test_…` en pruebas, `sk_live_…` en real) | Crear los pagos desde el servidor |
| `STRIPE_WEBHOOK_SECRET` | Se genera en el paso 2 (`whsec_…`) | Verificar que los avisos vienen de Stripe |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` | **Sin esta, el aviso de Stripe no puede inscribir a nadie** aunque el cobro pase |
| `PUBLIC_SITE_URL` | `https://grupo-fenix-demo.vercel.app` (o el dominio final) | Enlaces de los correos y regreso desde Stripe |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend | Correo de "pago confirmado" (opcional) |

Después de agregarlas: Deployments → el último → **Redeploy**, para que las tome.

## 2. Aviso de pagos (webhook)

Stripe → Developers → Webhooks → **Add endpoint**

- URL: `https://grupo-fenix-demo.vercel.app/api/stripe/webhook`
- Eventos (solo estos 4):
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded` (OXXO pagado)
  - `checkout.session.async_payment_failed` (OXXO no pagado)
  - `checkout.session.expired`
- Copia el *Signing secret* (`whsec_…`) a `STRIPE_WEBHOOK_SECRET` en Vercel.

Hay que hacerlo **dos veces**: una en modo prueba (Test mode) y otra en modo real (Live), porque cada modo tiene su propio secreto.

## 3. Métodos de pago

Stripe → Settings → Payment methods. La app no elige métodos: usa los que estén activos aquí.

- **Tarjeta**: activa por defecto.
- **OXXO**: activar. El pago se confirma cuando la persona paga en tienda (puede tardar hasta 3 días); la app lo recibe con `async_payment_succeeded`.
- **Meses sin intereses**: activar en *Card installments* si la cuenta lo permite.

Cupones: Stripe → Product catalog → Coupons → crear cupón y un *Promotion code*. La app ya acepta códigos en la página de pago.

## 4. Protección contra doble cobro (ya está en el código)

- **Botón**: se bloquea al primer clic; un segundo clic rápido no manda otra petición.
- **Llave de idempotencia**: dos peticiones iguales en el mismo minuto reciben la misma sesión de Stripe.
- **Reuso del pago abierto**: si la persona ya tiene un pago abierto de lo mismo (otra pestaña, botón atrás), se le regresa ese en lugar de abrir otro.
- **Base de datos**: una sola inscripción por persona y curso/evento (`docs/sql/inscripcion_unica.sql`, ya aplicado). Si llegan dos avisos de pago a la vez, el segundo no duplica.
- **Avisos repetidos de Stripe**: no duplican la inscripción ni el correo.

Si aun así alguien paga dos veces (por ejemplo, dos pagos OXXO distintos), las dos órdenes aparecen como pagadas en el panel y hay que reembolsar una desde Stripe → Payments → Refund.

## 5. Límite de intentos (rate limit)

- **En la app (ya está)**: máximo 5 intentos de pago por persona cada 10 minutos. Al pasarse, responde 429 "Hiciste muchos intentos seguidos".
- **Inicio de sesión y registro**: Supabase ya limita intentos por su cuenta (Authentication → Rate Limits).
- **Firewall de Vercel (recomendado)**: Vercel → proyecto → Firewall → Configure → New Rule:
  - If: *Request Path* *starts with* `/api/`
  - Then: **Rate Limit**, 100 peticiones por 60 s por IP, acción *Deny* (429).
  - Revisa que tu plan de Vercel incluya reglas de rate limit.

## 6. Probar antes de cobrar de verdad

1. Con llaves `sk_test_…` y el webhook de **Test mode**.
2. Inicia sesión como alumno, entra a un curso con precio (el "Curso de prueba" cuesta $10) y paga con la tarjeta de prueba de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.
3. Debe regresar a "Pago exitoso", la orden queda **pagada** en el panel y el curso aparece en "Mis cursos".
4. En Stripe → Developers → Webhooks → el endpoint, los eventos deben salir con respuesta **200**.
5. Para pasar a real: cambia `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` por las de Live y haz Redeploy.

Stripe no acepta cobros de $0. Un curso gratis no se puede inscribir con Stripe: hay que ponerle precio o inscribir a la persona desde el panel (Inscripciones).
