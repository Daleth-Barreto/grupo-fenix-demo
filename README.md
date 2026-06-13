# Grupo Fénix — App

Progressive Web App (PWA) de **Grupo Fénix**: plataforma de formación y congresos (congresos, capacitaciones, cursos, constancias y comprobantes). Construida con **Astro** + **React (islas)** + **Tailwind CSS**, desplegable en **Cloudflare Pages**.

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
| Deploy | Cloudflare Pages (`@astrojs/cloudflare` + Wrangler) |

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
| `npm run preview` | Previsualiza el build con Wrangler |
| `npm run deploy` | Build + deploy a Cloudflare Pages |

## 🔐 Variables de entorno

Crea un archivo `.env` (no se sube a Git):

```env
PUBLIC_SUPABASE_URL="https://[PROYECTO].supabase.co"
PUBLIC_SUPABASE_ANON_KEY="eyJhb..."
PUBLIC_STRIPE_PUBLIC_KEY="pk_live_..."
```

> En **modo demo** (sin variables) la app corre con datos mock y el pago se simula.

## 🌿 Ramas

- `main` — producción
- `dev` — integración / pruebas
- `test` — pruebas puntuales

---

© Grupo Fénix — Sistema de diseño *Phoenix Professional*.
