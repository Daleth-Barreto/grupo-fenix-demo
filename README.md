# Grupo Fénix — App

Progressive Web App (PWA) de **Grupo Fénix**: plataforma de formación y congresos (congresos, capacitaciones, cursos, constancias y comprobantes). Construida con **Astro** + **React (islas)** + **Tailwind CSS**, desplegada en **Vercel**.

🌐 Sitio oficial: [eventosgrupofenix.com](https://www.eventosgrupofenix.com/)

---

## 🧱 Stack

| Capa | Tecnología |
| :--- | :--- |
| Framework | Astro |
| Islas interactivas | React 19 |
| Estilos | Tailwind CSS v4 |
| Autenticación | Supabase Auth |
| Pagos | Stripe |
| Deploy | Vercel (`@astrojs/vercel`) |

## 🎨 Identidad (Phoenix Professional)

- **Navy** `#0f2a44` · **Naranja** `#fe9511` · **Amarillo** `#fec627`
- Tipografía **Poppins** · radios amables (`rounded-2xl` / `rounded-3xl`)
- Iconografía de marca: el **fénix** (`public/brand/phoenix/`) como acento decorativo

## 📁 Estructura

```text
/
├── public/
│   ├── brand/            # Logo y vectores del fénix
│   └── events/           # Imágenes de congresos
├── src/
│   ├── components/       # Islas React + componentes .astro (ui, navigation, auth…)
│   ├── data/             # mock.ts (datos de demo)
│   ├── layouts/          # AppLayout, AuthLayout, BaseLayout
│   ├── lib/              # supabase, stripe
│   ├── pages/app/        # Rutas de la app (ver abajo)
│   ├── store/            # Estado (nanostores)
│   ├── types/            # Modelos TypeScript
│   └── utils/            # format (fechas, moneda)
├── astro.config.mjs
└── wrangler.jsonc
```

## 🗺️ Rutas principales

> La app vive bajo `/app/...`

| Ruta | Pantalla |
| :--- | :--- |
| `/app/login` · `/app/registro` | Autenticación (Supabase) |
| `/app/inicio` | Dashboard con próximo congreso |
| `/app/congresos` · `/app/congresos/[id]` | Catálogo y detalle |
| `/app/checkout/[id]` | Pago (Stripe, IVA opcional) |
| `/app/cursos` · `/app/cursos/[id]` | Cursos y temario (videos + actividades) |
| `/app/constancias` | Certificados con valor curricular |
| `/app/comprobantes` | Historial de pagos y facturas |
| `/app/galeria` | Eventos realizados |
| `/app/reservaciones` | Cotización y contacto |
| `/app/perfil` · `/app/configuracion` | Perfil y ajustes |

## 🧞 Comandos

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local en `localhost:4321` (abre `/app/inicio`) |
| `npm run build` | Compila el sitio a `./dist/` |
| `npm run check` | Revisa los tipos con `astro check` |

## 🔐 Variables de entorno

Crea un archivo `.env` (no se sube a Git):

```env
PUBLIC_SUPABASE_URL="https://[PROYECTO].supabase.co"
PUBLIC_SUPABASE_ANON_KEY="eyJhb..."
```

En Vercel, las mismas variables van en Settings → Environment Variables.

Variables opcionales, solo de servidor (nunca con `PUBLIC_`):

```env
SUPABASE_SERVICE_ROLE_KEY="..."   # webhook de Stripe y baja de cuenta
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Sin `SUPABASE_SERVICE_ROLE_KEY`, las APIs usan el token del usuario y las reglas RLS de Supabase. Sin las variables de Stripe, el checkout avisa que el pago no está disponible: no se simula ningún pago.

## 🗄️ Base de datos

Correr en Supabase → SQL Editor, además del esquema base:

- `docs/sql/user_progress.sql`: progreso de lecciones
- `docs/sql/reservation_requests.sql`: solicitudes de cotización
- `docs/sql/avatars.sql`: fotos de perfil

## 💳 Webhook de Stripe

Registrar `https://TU-DOMINIO/api/stripe/webhook` con los eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`.

## 📌 Estado

- **Funciona con servidor:** autenticación y roles, panel de admin, pago con Stripe Checkout, webhook, comprobantes, constancias, progreso, reservaciones, control de acceso a transmisiones.
- **Despliegue:** Vercel con `@astrojs/vercel`; las rutas `/api/*` y `/app/en-vivo/*` corren como funciones de servidor.
- **Stripe:** pendiente de configurar.
- **Catálogo de ejemplo:** eventos, cursos y galería de la app salen de `src/data/mock.ts`, no de Supabase. Lo creado en el panel de admin todavía no aparece en la app.
- **Próximamente:** constructor de cursos, biblioteca de medios, generación de constancias en PDF, URL firmada para transmisiones.

## 🌿 Ramas

- `main` — producción
- `dev` — integración / pruebas
- `test` — pruebas puntuales

---

© Grupo Fénix — Sistema de diseño *Phoenix Professional*.
