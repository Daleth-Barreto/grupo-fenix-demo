/* Generador de documentación Word — Grupo Fénix Frontend */
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  TableOfContents, PageNumber, Header, Footer, PageBreak, LevelFormat,
} = require('docx')

const NAVY = '0A192F'
const ORANGE = 'FD761A'
const GREY = '44474D'
const LIGHT = 'F0F3FF'

// ---------- helpers ----------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] })
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] })
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] })
const P = (t, opts = {}) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, ...opts })] })
const bullet = (t) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [new TextRun(t)] })
const num = (t) => new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 60 }, children: [new TextRun(t)] })
const code = (t) => new Paragraph({
  spacing: { after: 120 },
  shading: { fill: 'F4F3EC', type: ShadingType.CLEAR },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: ORANGE, space: 8 } },
  children: [new TextRun({ text: t, font: 'Consolas', size: 19 })],
})

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder }

function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0)
  const headRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20 })] })],
    })),
  })
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: ri % 2 ? 'FFFFFF' : LIGHT, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 19 })] })],
    })),
  }))
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: [headRow, ...bodyRows] })
}

// ---------- document ----------
const doc = new Document({
  creator: 'Grupo Fénix',
  title: 'Documentación Técnica — Grupo Fénix Frontend',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: '151C27' } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, color: NAVY, font: 'Arial' },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, color: NAVY, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, color: ORANGE, font: 'Arial' },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // -------- Portada --------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 2400, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GRUPO FÉNIX', bold: true, size: 72, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Plataforma de Formación y Congresos', size: 30, color: ORANGE, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 }, children: [new TextRun({ text: 'Documentación Técnica del Frontend (PWA)', size: 26, color: GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } }, spacing: { before: 240, after: 240 }, children: [new TextRun({ text: 'React 18 · TypeScript · Tailwind CSS v4 · Zustand · Supabase · Stripe', size: 22, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200 }, children: [new TextRun({ text: 'Versión 1.0.0', size: 24, bold: true, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sistema de diseño: Phoenix Professional', size: 22, color: GREY })] }),
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Índice')] }),
        new TableOfContents('Tabla de contenido', { hyperlink: true, headingStyleRange: '1-3' }),
      ],
    },
    // -------- Contenido --------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } }, children: [new TextRun({ text: 'Grupo Fénix — Documentación Técnica', size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Página ', size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
      children: [
        // 1. Introducción
        H1('1. Introducción'),
        P('Grupo Fénix App es una Progressive Web App (PWA) corporativa para la gestión de congresos, capacitaciones, cursos y constancias de valor profesional. Está construida con un enfoque modular que separa estrictamente la lógica de negocio de la interfaz gráfica, con el objetivo de reutilizar la capa de lógica en una futura migración a aplicación móvil nativa (React Native).'),
        P('Este documento describe la arquitectura, el sistema de diseño, la estructura de archivos, los módulos implementados y la guía de integración para el equipo de desarrollo.'),

        H2('1.1 Stack Tecnológico'),
        table(['Capa', 'Tecnología'], [
          ['Framework', 'React 18 + Vite'],
          ['Lenguaje', 'TypeScript (modo estricto, sin uso de any)'],
          ['Estilos', 'Tailwind CSS v4 (configuración por @theme en CSS)'],
          ['Estado global', 'Zustand (con persistencia)'],
          ['Autenticación', 'Supabase Auth (JWT)'],
          ['API de datos', 'NestJS (vía Axios con token inyectado)'],
          ['Pagos', 'Stripe (@stripe/stripe-js)'],
          ['Enrutamiento', 'React Router v6 (con code-splitting por ruta)'],
          ['PWA', 'vite-plugin-pwa (Service Worker + manifiesto, instalable y offline)'],
        ], [3120, 6240]),

        // 2. Arquitectura
        H1('2. Arquitectura del Sistema'),
        P('El proyecto desacopla la capa de presentación de la lógica de datos para garantizar escalabilidad y facilitar el desarrollo móvil nativo. Las reglas de separación son estrictas:'),
        H3('Capa de Lógica (/hooks, /store, /services)'),
        bullet('Hooks personalizados: toda la lógica de conexión a la API, Supabase y manejo de estado asíncrono reside en hooks (useAuth, useEvents, useCheckout, etc.).'),
        bullet('Servicios: clientes HTTP de Axios preconfigurados con el JWT de Supabase inyectado automáticamente.'),
        bullet('Store (Zustand): estado global de sesión persistido.'),
        H3('Capa de Presentación (/pages, /components)'),
        bullet('Las vistas SOLO consumen hooks y renderizan la interfaz. No contienen lógica de negocio ni llamadas directas a Axios/Fetch.'),
        bullet('Componentes comunes reutilizables (Button, Input, Badge, Spinner, ProgressBar) garantizan consistencia visual.'),
        H3('Flujo de Autenticación'),
        P('El frontend realiza login/registro directamente con el SDK de Supabase para obtener el JWT. Todas las peticiones subsecuentes al backend NestJS inyectan ese token en el header Authorization. Un interceptor de Axios cierra la sesión automáticamente ante un 401.'),

        // 3. Sistema de diseño
        H1('3. Sistema de Diseño — Phoenix Professional'),
        P('Estética de Minimalismo Moderno: claridad, autoridad profesional y navegación sin esfuerzo. Enfoque "light-first" con contraste entre tonos corporativos profundos y acentos vibrantes de acción.'),
        H2('3.1 Paleta de Colores'),
        table(['Token', 'Hex', 'Uso'], [
          ['primary (Deep Navy)', '#0A192F', 'Textos principales, heros, autoridad'],
          ['secondary (Vibrant Orange)', '#FD761A', 'CTAs, estados activos, progreso'],
          ['secondary-deep', '#9D4300', 'Hover de botones primarios'],
          ['gold (acento premium)', '#C9A227', 'Sellos de valor curricular'],
          ['background', '#F9F9FF', 'Fondo general'],
          ['surface', '#FFFFFF', 'Tarjetas y superficies'],
          ['surface-variant', '#DCE2F3', 'Bordes y divisores'],
          ['error', '#BA1A1A', 'Estados de error'],
        ], [3200, 1600, 4560]),
        H2('3.2 Tipografía'),
        P('Fuente exclusiva: Poppins. Títulos en pesos Bold/Semi-Bold con tracking ligeramente ajustado; cuerpos con interlineado generoso (leading-relaxed) para reducir la fatiga visual.'),
        H2('3.3 Radios y Elevación'),
        bullet('Tarjetas contenedoras: rounded-3xl (24–28px).'),
        bullet('Botones e inputs: rounded-2xl (16px).'),
        bullet('Badges / chips: rounded-full (forma de píldora).'),
        bullet('Elevación Flat-Layered: sombras muy tenues (shadow-card / shadow-elevated) o bordes de 1px en gris claro. Profundidad por peso de color (navy sobre blanco), no por sombras pesadas.'),
        H2('3.4 Configuración en Tailwind v4'),
        P('IMPORTANTE: el proyecto usa Tailwind CSS v4, donde los tokens de diseño se definen en CSS mediante el bloque @theme dentro de src/index.css (fuente de verdad). El archivo tailwind.config.js es un espejo documental para compatibilidad de herramientas; ambos deben mantenerse sincronizados.'),

        // 4. Estructura de carpetas
        H1('4. Estructura del Proyecto'),
        code('grupo-fenix-frontend/'),
        code('├─ public/                 # Assets estáticos, favicon, manifiesto PWA'),
        code('├─ src/'),
        code('│  ├─ assets/              # Imágenes y recursos locales'),
        code('│  ├─ components/'),
        code('│  │  ├─ common/           # Button, Input, Badge, Spinner, ProgressBar'),
        code('│  │  ├─ layout/           # TopBar, BottomNav'),
        code('│  │  ├─ auth/             # ProtectedRoute'),
        code('│  │  └─ events/           # EventCard, FeaturedEventHero'),
        code('│  ├─ hooks/'),
        code('│  │  ├─ api/              # useEvents, useEventDetail, useCourses, useCheckout, useGallery'),
        code('│  │  ├─ auth/             # useAuth (useAuthSession + useAuth)'),
        code('│  │  └─ useScrollCollapse.ts'),
        code('│  ├─ pages/'),
        code('│  │  ├─ auth/             # Login, Register'),
        code('│  │  ├─ inicio/           # InicioPage'),
        code('│  │  ├─ congresos/        # CongresosPage (catálogo)'),
        code('│  │  ├─ events/           # EventDetails'),
        code('│  │  ├─ checkout/         # Checkout (Stripe)'),
        code('│  │  ├─ cursos/           # MisCursos, CourseDashboard, VideoPlayer'),
        code('│  │  ├─ constancias/      # ConstanciasPage'),
        code('│  │  ├─ galeria/          # GaleriaPage (eventos realizados)'),
        code('│  │  ├─ reservaciones/    # ReservacionesPage (cotización + contacto)'),
        code('│  │  └─ perfil/           # PerfilPage, ConfiguracionPage'),
        code('│  ├─ services/            # api, events, courses, payments, gallery, mock.data'),
        code('│  ├─ store/               # auth.store (Zustand)'),
        code('│  ├─ lib/                 # supabase, stripe'),
        code('│  ├─ utils/               # format (fechas, moneda)'),
        code('│  ├─ types/               # Modelos TypeScript'),
        code('│  ├─ App.tsx              # Enrutador + sesión'),
        code('│  └─ main.tsx             # Punto de entrada'),
        code('├─ .env / .env.example     # Variables de entorno'),
        code('├─ tailwind.config.js      # Espejo del design system'),
        code('└─ index.css               # @theme (tokens reales)'),

        // 5. Módulos
        H1('5. Módulos y Archivos Clave'),

        H2('5.1 Tipos (src/types/index.ts)'),
        P('Define las interfaces de dominio: User, Event, Course, Module, Lesson, Constancia, GalleryEvent y los tipos de filtro. Centraliza el tipado estricto consumido por hooks y vistas.'),

        H2('5.2 Servicios (src/services/)'),
        table(['Archivo', 'Responsabilidad'], [
          ['api.ts', 'Instancia Axios; inyecta JWT de Supabase; cierra sesión en 401.'],
          ['events.service.ts', 'Endpoints de eventos (listado, detalle, inscripción).'],
          ['courses.service.ts', 'Cursos del usuario, lecciones y constancias.'],
          ['payments.service.ts', 'Crea sesión de pago Stripe en el backend NestJS.'],
          ['gallery.service.ts', 'Eventos realizados (galería).'],
          ['reservations.service.ts', 'Envío de solicitudes de reservación/cotización.'],
          ['mock.data.ts', 'Datos de respaldo para desarrollo sin backend.'],
        ], [2600, 6760]),

        H2('5.3 Hooks (src/hooks/)'),
        table(['Hook', 'Función'], [
          ['useAuthSession()', 'Monta el listener de sesión Supabase (una sola vez en App).'],
          ['useAuth()', 'Estado + acciones: login, registro, reset, logout.'],
          ['useEvents()', 'Catálogo + evento destacado derivado.'],
          ['useEventDetail(id)', 'Detalle de un evento por id.'],
          ['useCheckout()', 'Máquina de estados del pago (idle/processing/success/error).'],
          ['useCourses()/useCourseById()', 'Cursos y constancias del usuario.'],
          ['useGallery()', 'Eventos realizados + años derivados.'],
          ['useReservation()', 'Asistente multi-paso de reservación/cotización.'],
          ['useScrollCollapse(px)', 'Colapso de header al hacer scroll (efecto SliverAppBar).'],
        ], [3000, 6360]),

        H2('5.4 Store (src/store/auth.store.ts)'),
        P('Estado global de sesión con Zustand + middleware persist: user, isAuthenticated, isLoading y acciones setUser/setLoading/logout. Persistido en localStorage bajo la clave "fenix-auth".'),

        H2('5.5 Pantallas (src/pages/)'),
        table(['Pantalla', 'Ruta', 'Descripción'], [
          ['Login / Register', '/login, /registro', 'Acceso y alta con validación y Supabase.'],
          ['InicioPage', '/inicio', 'Dashboard: hero, cuenta regresiva, accesos, eventos.'],
          ['CongresosPage', '/congresos', 'Catálogo: buscador, filtros, hero, tarjetas.'],
          ['EventDetails', '/congresos/:id', 'Detalle con hero, beneficios y CTA fija.'],
          ['Checkout', '/checkout/:id', 'Pasarela Stripe con resumen y confirmación.'],
          ['MisCursos / Dashboard / Video', '/cursos…', 'Cursos, módulos (acordeón) y reproductor.'],
          ['ConstanciasPage', '/constancias', 'Certificados con descarga/visualización.'],
          ['GaleriaPage', '/galeria', 'Eventos realizados (masonry + lightbox).'],
          ['ReservacionesPage', '/reservaciones', 'Asistente de cotización (3 pasos) + contacto.'],
          ['Perfil / Configuración', '/perfil, /configuracion', 'Datos, menú y ajustes con toggles.'],
        ], [2900, 2200, 4260]),

        // 6. Flujo de pago
        H1('6. Flujo de Inscripción y Pago (Stripe)'),
        num('El usuario abre un congreso desde el catálogo o el inicio → /congresos/:id.'),
        num('En el detalle pulsa "Inscribirme" → /checkout/:id.'),
        num('Checkout muestra el resumen (subtotal, IVA 16%, total) y el método de pago.'),
        num('Al pulsar "Pagar", useCheckout solicita al backend NestJS una sesión de Stripe.'),
        num('Si el backend devuelve una URL → redirección a Stripe Checkout. Si devuelve clientSecret → Elements embebido.'),
        num('En modo demostración (sin VITE_STRIPE_PUBLIC_KEY) el cobro se simula y se muestra la confirmación.'),
        P('La llave secreta de Stripe JAMÁS reside en el frontend: vive en el backend. El frontend solo usa la llave pública.', { italics: true }),

        // 7. Reservaciones
        H1('7. Módulo de Reservaciones y Cotización'),
        P('Asistente premium de 3 pasos para solicitar eventos a medida (congresos, capacitaciones, cursos/talleres o eventos corporativos), más canales de contacto directo. La lógica vive íntegramente en el hook useReservation; la vista solo renderiza.'),
        num('Paso 1 — Interés: el usuario elige el tipo de servicio mediante tarjetas seleccionables.'),
        num('Paso 2 — Datos: nombre, correo, teléfono, organización, n.º de asistentes y fecha tentativa (con validación por campo).'),
        num('Paso 3 — Detalle: resumen de la solicitud + mensaje libre, y envío al backend (POST /reservations).'),
        P('En modo demostración (sin backend) el envío se simula y se muestra la confirmación. Los datos del usuario autenticado prellenan el formulario. Canales de contacto incluidos: WhatsApp, correo (atencion@eventosgrupofenix.com) y el sitio web oficial.'),

        // 8. Variables de entorno
        H1('8. Variables de Entorno'),
        P('Copia .env.example a .env y completa los valores. El archivo .env NO se sube a GitHub.'),
        code('VITE_SUPABASE_URL="https://[PROYECTO].supabase.co"'),
        code('VITE_SUPABASE_ANON_KEY="eyJhb..."'),
        code('VITE_API_URL="http://localhost:3000/api"'),
        code('VITE_STRIPE_PUBLIC_KEY="pk_live_..."'),

        // 9. PWA
        H1('9. Progressive Web App (PWA)'),
        P('La aplicación es una PWA instalable y con soporte offline, configurada con vite-plugin-pwa en vite.config.ts.'),
        H3('Características'),
        bullet('Instalable: manifiesto (manifest.webmanifest) con nombre, íconos (192/512 y maskable), theme_color navy (#0A192F) y display standalone.'),
        bullet('Service Worker con autoUpdate: precachea la app (JS/CSS/HTML/íconos/fuentes) para arranque y uso sin conexión.'),
        bullet('Estrategias de runtime caching: CacheFirst para Google Fonts y StaleWhileRevalidate para imágenes remotas (Unsplash).'),
        bullet('Íconos de marca generados por script (navy con la "F" naranja): scripts/gen-icons.cjs → public/.'),
        bullet('Metadatos iOS (apple-touch-icon, apple-mobile-web-app-*) para instalación en Safari/iOS.'),
        H3('Verificación'),
        code('npm run build   # genera dist/sw.js, workbox-*.js y manifest.webmanifest'),
        code('npm run preview # prueba la PWA compilada y el Service Worker'),
        P('Tras el build, el navegador (Chrome/Edge/Safari) ofrece "Instalar app". Una vez instalada, abre en ventana propia y carga sin conexión.'),

        // 10. Guía de integración
        H1('10. Guía de Integración y Verificación'),
        H3('Instalación'),
        code('cd grupo-fenix-frontend'),
        code('npm install'),
        H3('Desarrollo'),
        code('npm run dev      # http://localhost:5173'),
        H3('Verificación de calidad (obligatoria antes de cada entrega)'),
        code('npx tsc --noEmit   # 0 errores de tipos'),
        code('npm run build      # build de producción'),
        P('El proyecto aplica code-splitting por ruta (React.lazy + Suspense en App.tsx): Vite genera un chunk independiente por pantalla, por lo que el bundle inicial se mantiene reducido (~390 KB) y cada vista se descarga bajo demanda al navegar.'),
        H3('Modo demo vs. producción'),
        bullet('Sin variables de entorno reales, los hooks usan datos mock y el pago se simula — la app es 100% navegable.'),
        bullet('Al definir las variables, los servicios conmutan automáticamente al backend y a Stripe reales.'),

        // 11. Seguridad y rutas protegidas
        H1('11. Rutas Protegidas y Seguridad'),
        P('El componente ProtectedRoute está implementado y listo para usarse. En modo demostración, las rutas de la app van públicas para permitir el recorrido sin backend. Para exigir sesión, se envuelven las rutas privadas en App.tsx:'),
        code('<Route element={<ProtectedRoute />}>'),
        code('  <Route path="/perfil" element={<PerfilPage />} />'),
        code('  <Route path="/checkout/:id" element={<Checkout />} />'),
        code('</Route>'),
        P('ProtectedRoute redirige a /login conservando la ruta de origen, y muestra un Spinner mientras Supabase verifica la sesión inicial.'),

        // 12. Próximos pasos
        H1('12. Próximos Pasos Recomendados'),
        bullet('Activar ProtectedRoute end-to-end cuando el backend Supabase esté en vivo.'),
        bullet('Notificaciones push (Web Push) para recordatorios de congresos inscritos.'),
        bullet('Implementar el reproductor de video real y el seguimiento de progreso de lecciones contra la API.'),
        bullet('Conectar la emisión y descarga real de constancias en PDF.'),
        bullet('Migrar la capa /hooks a la app móvil nativa (React Native) reutilizando la lógica.'),

        new Paragraph({ spacing: { before: 480 }, alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 8 } }, children: [new TextRun({ text: 'Documento generado para Grupo Fénix — Sistema de diseño Phoenix Professional', size: 18, italics: true, color: GREY })] }),
      ],
    },
  ],
})

const outName = process.argv[2] || 'Documentacion-Grupo-Fenix-Frontend.docx'
const out = path.resolve(__dirname, '..', '..', outName)
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf)
  console.log('OK ->', out)
})
