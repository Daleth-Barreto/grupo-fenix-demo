# Auditoría de la app Grupo Fénix

Vistas, UI/UX, responsividad móvil, funcionalidad, seguridad y despliegue.

- **Repositorio:** Daleth-Barreto/grupo-fenix-demo
- **Revisión original:** rama `main`, commit `6611754`
- **Estado en `dev`:** revisado en `0f33cd3`; ver la sección 7
- **Fecha:** 29 de octubre de 2026

## 1. Resumen ejecutivo

La app tiene una base sólida en diseño y estructura (Astro, React y Tailwind, con un sistema de color consistente). Sin embargo, es un prototipo: el pago, las transmisiones en vivo, el progreso de cursos, las reservaciones y la recuperación de contraseña están simulados o incompletos.

**Recomendación:** no publicar cobros reales ni transmisiones en vivo hasta cerrar los hallazgos críticos y altos de las fases 0 y 1.

**Hallazgos:** 4 críticos, 16 altos, 14 medios y 7 bajos (41 hallazgos en total).

## 2. Alcance y método

- Revisión estática del código de las rutas de `src/pages`, componentes, layouts, estilos, datos de demostración, API, configuración y workflows.
- Verificación puntual de fechas en la zona America/Mexico_City, contraste WCAG (cálculo de luminancia), enlaces contra rutas existentes y progreso de cursos contra sus lecciones.
- No se ejecutó la app en navegador ni en dispositivos reales. Los hallazgos de móvil deben confirmarse en pantalla.
- Fuera de alcance: pruebas de penetración, reglas RLS de Supabase y configuración de Stripe, Cloudflare y GitHub.

## 3. Auditoría por vista

| Vista | Ruta | Prioridad | Problemas principales | Hallazgos |
| --- | --- | --- | --- | --- |
| Inicio | /app/inicio | Alto | Destacado ya pasado con "0 días"; estadísticas fijas; banner EN VIVO falso; fechas corridas un día. | A1, A2, A3, A16 |
| Inicio de sesión, registro y recuperación | /app/login, /registro, /recuperar | Crítico | Enlace de recuperación a una ruta inexistente; el campo de registro pierde el foco; enlace a /terminos inexistente. | C4, A5, A12 |
| Congresos (lista y detalle) | /app/congresos, /congresos/[id] | Alto | Fechas un día antes; eventos pasados inscribibles; el destacado aparece dos veces; cuenta regresiva fija; beneficios genéricos. | A1, A2, M2, M10 |
| Checkout (pago, éxito y error) | /app/checkout/[id], /exito, /error | Crítico | Formulario propio que pide número de tarjeta y CVV; pago simulado; la página de éxito no verifica nada y no exige sesión. | C1, B5 |
| Reservaciones | /app/reservaciones | Alto | La solicitud no se envía pero confirma que un asesor contactará; los pasos pueden cortarse con el teclado en móvil. | A6, M5 |
| Mis cursos | /app/cursos | Medio | Progreso de la tarjeta distinto al del detalle (65 % frente a 33 % en c1); tipo de filtro inconsistente. | A7, M13 |
| Detalle de curso | /app/cursos/[id] | Medio | Acordeón sin estado accesible; lecciones bloqueadas con enlace "#"; sin fallback si faltan módulos. | M6, M12 |
| Reproductor de lección | /app/cursos/[id]/video/[lessonId] | Alto | No reproduce video; progreso fijo; tiempo mal calculado; progreso que no se guarda; descargas sin función; controles menores a 44 px. | A7, A8, M7 |
| En vivo | /app/en-vivo/[id] | Crítico | Stream y estado generados al compilar; URL del stream visible en el HTML; el endpoint de acceso siempre responde "no permitido". | C2, C3, A3 |
| Constancias | /app/constancias | Medio | Botones "Descargar PDF" y "Ver" sin función; una constancia tiene fecha anterior al evento. | A12, A16 |
| Comprobantes | /app/comprobantes | Bajo | Siempre muestra estado vacío porque no hay backend. | A16 |
| Galería | /app/galeria | Alto | Las cuatro tarjetas llevan a páginas que dan 404; imágenes sin dimensiones. | A4, M9 |
| Perfil | /app/perfil | Medio | Inicial "M" y "Usuario" antes de cargar; "3 eventos" fijo; dos botones de cerrar sesión; editar foto sin función. | A16, A12, B6 |
| Configuración | /app/configuracion | Alto | 5 enlaces "#"; interruptores que no guardan; "Sí, eliminar mi cuenta" no hace nada; diálogo sin manejo de foco ni Esc. | A12, M6 |
| Cabecera y navegación inferior | Global (TopBar, BottomNav) | Alto | La cabecera queda bajo la barra de estado en iPhone instalado; botón "Atrás" con javascript:; etiquetas de 10 px. | A10, B5, M1 |
| Estilo global | Global (tema y CSS) | Alto | Texto blanco sobre naranja con contraste de 2.2:1; colores fuera de tokens; no hay manifest ni service worker. | A9, A11, M4 |

## 4. Registro de hallazgos

Severidad: **Crítico** (bloquea lanzamiento o afecta dinero, seguridad o acceso), **Alto** (afecta la experiencia de forma importante), **Medio** (calidad y mantenimiento), **Bajo** (limpieza).

### C1 · Crítico · Checkout simulado con captura de datos de tarjeta

- **Ubicación:** `components/checkout/CheckoutForm.tsx; pages/app/checkout/exito.astro`
- **Hallazgo:** El formulario pide titular, número de tarjeta, vencimiento y CVV dentro de la app y "procesa" el pago con un setTimeout de 2 s. Después muestra "Pago exitoso" y dice que se envió un recibo por correo, sin cobrar ni enviar nada. La página /app/checkout/exito no verifica ningún pago y es accesible sin sesión.
- **Recomendación:** Usar Stripe Checkout o Payment Element (la clave pública y stripe-js ya están configuradas). Crear la sesión en el servidor. Dar acceso solo después del webhook checkout.session.completed verificado. La página de éxito debe confirmar el pago en el servidor usando session_id.

### C2 · Crítico · Adaptador de Cloudflare no configurado: los endpoints del servidor no se desplegarán

- **Ubicación:** `astro.config.mjs; pages/api/**`
- **Hallazgo:** Se importa @astrojs/cloudflare pero no se usa: no hay "adapter" ni "output: server". El build resultante es 100 % estático, así que /api/stripe/webhook y /api/live/access no se ejecutan como endpoints en producción.
- **Recomendación:** Agregar adapter: cloudflare() y output "server" (o modo híbrido con prerender en las páginas estáticas). Validar con npm run build y wrangler pages dev. Confirmar que los secretos (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) se leen del runtime (env) y no solo de import.meta.env.

### C3 · Crítico · Transmisiones en vivo sin control de acceso

- **Ubicación:** `pages/app/en-vivo/[id].astro; pages/api/live/access.ts; components/live/LivePlayer.tsx`
- **Hallazgo:** La URL HLS se incluye en el HTML estático de la página. El endpoint de acceso siempre responde allowed: false (es un stub), no valida sesión ni inscripción, y LivePlayer ni siquiera lo llama. Cualquiera que tenga el HTML puede ver el contenido.
- **Recomendación:** No exponer hls_url en el HTML. El endpoint debe validar la sesión (Supabase) y la inscripción, y devolver una URL firmada de vida corta. Eliminar el estado "live" y las URLs de prueba del build.

### C4 · Crítico · Recuperación de contraseña rota

- **Ubicación:** `components/auth/ResetPasswordForm.tsx; pages/app/recuperar.astro`
- **Hallazgo:** El enlace del correo de recuperación apunta a /app/reset-password, pero esa ruta no existe. Tampoco hay una pantalla para escribir la nueva contraseña. Un usuario que olvide su clave no puede recuperar su cuenta.
- **Recomendación:** Crear /app/reset-password: detectar el token de recuperación de Supabase y llamar a updateUser({ password }). Validar la contraseña nueva (mínimo 8 caracteres) y mostrar confirmación.

### A1 · Alto · Las fechas se muestran un día antes (verificado)

- **Ubicación:** `utils/format.ts (formatDateRange, getDateChip, daysUntil); data/mock.ts`
- **Hallazgo:** Verificado: new Date("2026-10-21") en America/Mexico_City es el 20 de octubre a las 18:00, así que se muestra "20 de octubre". Afecta chips de fecha, rangos, el destacado y el detalle de cada congreso.
- **Recomendación:** Para fechas en formato "YYYY-MM-DD" formatear con timeZone: "UTC" o construir la fecha en la zona local. Probar con TZ=America/Mexico_City.

### A2 · Alto · El evento "destacado" ya pasó

- **Ubicación:** `components/events/FeaturedHero.astro; pages/app/inicio.astro; data/mock.ts`
- **Hallazgo:** Hoy es 29 de octubre de 2026. El 1er Congreso de Neurodesarrollo (21 al 24 de octubre) sigue marcado como destacado. Inicio lo presenta como "Próximo congreso" con "0 días" y el botón "Reservar mi lugar". Los eventos pasados (1, 5 y 6) siguen siendo inscribibles.
- **Recomendación:** Filtrar por fecha en el servidor. Elegir el próximo evento automáticamente. Marcar los pasados como "Finalizado" y ocultar el botón de inscripción.

### A3 · Alto · Banner "EN VIVO" falso y contenido en vivo generado al compilar

- **Ubicación:** `components/live/LiveBanner.tsx; pages/app/en-vivo/[id].astro`
- **Hallazgo:** LiveBanner muestra siempre "Congreso Internacional de Medicina 2026" como transmisión en vivo y enlaza a un stream de prueba público (test-streams.mux.dev). En en-vivo/[id] el estado y scheduled_at se fijan al compilar (new Date() en build).
- **Recomendación:** Leer el estado de las transmisiones desde Supabase u Owncast en cada petición. Quitar los datos mock de producción.

### A4 · Alto · La galería enlaza a páginas que no existen

- **Ubicación:** `pages/app/galeria.astro; data/mock.ts (MOCK_GALLERY)`
- **Hallazgo:** Las cuatro tarjetas (g1 a g4) apuntan a /app/congresos/g1…g4. Solo existen las rutas de los eventos 1 a 6, así que estas páginas dan 404.
- **Recomendación:** Crear una página de galería por evento o quitar el enlace hasta tener la página.

### A5 · Alto · El campo de registro pierde el foco al escribir

- **Ubicación:** `components/auth/RegisterForm.tsx`
- **Hallazgo:** El componente Field se define dentro del render de RegisterForm. En cada tecla React crea un componente nuevo y desmonta el input, por lo que el cursor se pierde. Afecta a los cuatro campos del formulario.
- **Recomendación:** Mover Field fuera de RegisterForm, como componente independiente, y probar escribiendo en móvil y en escritorio.

### A6 · Alto · Reservaciones no envía nada, pero confirma el envío

- **Ubicación:** `pages/app/reservaciones.astro`
- **Hallazgo:** El botón "Solicitar" solo muestra la pantalla "Solicitud enviada" ("un asesor académico se pondrá en contacto contigo"). Los datos se pierden: no hay endpoint, ni correo, ni base de datos.
- **Recomendación:** Conectar a un endpoint (Supabase o correo transaccional) con manejo de errores. Mientras tanto, no mostrar una confirmación falsa.

### A7 · Alto · Progreso de cursos inconsistente y que no se guarda

- **Ubicación:** `pages/app/cursos/index.astro; pages/app/cursos/[id].astro; components/courses/MarkCompleteButton.tsx`
- **Hallazgo:** La lista muestra c1 al 65 % y c3 al 30 %, pero el detalle calcula por lecciones: c1 al 33 % (2 de 6) y c3 al 50 % (1 de 2). El botón "Marcar como completada" tiene un TODO y no guarda nada; al recargar se pierde.
- **Recomendación:** Usar una sola fuente de verdad: las lecciones completadas en Supabase (user_progress), con el porcentaje calculado en el servidor. Enviar courseId al guardar (hoy no se usa).

### A8 · Alto · El reproductor de lecciones no reproduce video

- **Ubicación:** `components/courses/VideoPlayer.tsx; pages/app/cursos/[id]/video/[lessonId].astro`
- **Hallazgo:** No hay elemento <video>. El botón de play solo cambia el icono. El progreso está fijo en 35 %. El tiempo se calcula con parseInt("24:15") = 24. Las descargas de recursos no hacen nada.
- **Recomendación:** Integrar <video> o HLS con la URL de cada lección, progreso real y eventos de reproducción. Ocultar la pestaña "Recursos" hasta tener archivos reales.

### A9 · Alto · Contraste insuficiente: texto blanco sobre naranja

- **Ubicación:** `styles/index.css (tokens secondary); botones y badges en todo el sitio`
- **Hallazgo:** Texto blanco sobre #fe9511 tiene una relación de 2.2:1 (WCAG AA exige 4.5:1 en texto normal). Afecta botones principales, badges, enlaces naranjas sobre blanco y los botones "Inscribirme" y "Continuar".
- **Recomendación:** Usar texto navy #0f2a44 sobre naranja (6.6:1), o usar #b34700 con texto blanco (5.5:1). Para enlaces, #9d4300 sobre blanco (6.5:1).

### A10 · Alto · La barra superior queda bajo la barra de estado en iPhone

- **Ubicación:** `components/navigation/TopBar.astro; BaseLayout.astro`
- **Hallazgo:** BaseLayout usa apple-mobile-web-app-status-bar-style "black-translucent", pero TopBar no tiene padding superior con env(safe-area-inset-top). En la app instalada (PWA) el contenido queda debajo de la hora y del notch.
- **Recomendación:** Agregar padding-top: env(safe-area-inset-top) a TopBar y a las cabeceras propias de las páginas (congresos/[id], cursos, checkout, en vivo).

### A11 · Alto · La PWA no es instalable

- **Ubicación:** `public/ (sin manifest ni service worker)`
- **Hallazgo:** No hay manifest (site.webmanifest) ni service worker, aunque el README describe la app como PWA. Sin manifest no hay instalación ni modo standalone.
- **Recomendación:** Agregar manifest con íconos de 192 y 512 px, colores de tema, display "standalone" y un service worker (por ejemplo con @vite-pwa/astro) con caché básica.

### A12 · Alto · Enlaces muertos y acciones que no hacen nada

- **Ubicación:** `pages/app/configuracion.astro; constancias.astro; perfil.astro; VideoPlayer.tsx; RegisterForm.tsx`
- **Hallazgo:** Configuración tiene 5 enlaces href="#" (información personal, contraseña, métodos de pago, términos, privacidad) y los interruptores no guardan. El botón "Sí, eliminar mi cuenta" no tiene función. Constancias: "Descargar PDF" y "Ver" no hacen nada. Perfil: el botón de editar foto no hace nada. El enlace de términos apunta a /terminos, que no existe.
- **Recomendación:** Ocultar o deshabilitar lo que no está implementado con la etiqueta "Próximamente". No mostrar botones destructivos sin función.

### A13 · Alto · Sin cabeceras de seguridad

- **Ubicación:** `public/_headers`
- **Hallazgo:** El archivo solo define cabeceras de caché. Faltan Content-Security-Policy (o frame-ancestors), X-Content-Type-Options, Referrer-Policy, Permissions-Policy y Strict-Transport-Security.
- **Recomendación:** Definirlas en _headers. Al escribir la CSP, contemplar Google Fonts, Stripe, Supabase y el enlace javascript: que hoy usa TopBar.

### A14 · Alto · La validación de ramas no se ejecuta

- **Ubicación:** `pr-validation.yaml (en la raíz del repo)`
- **Hallazgo:** GitHub solo lee workflows dentro de .github/workflows/. Como pr-validation.yaml está en la raíz, la regla "PR a main solo desde dev" y "PR a dev solo desde test" no está activa.
- **Recomendación:** Mover el archivo a .github/workflows/ y probarlo con un PR de prueba.

### A15 · Alto · Fallback silencioso a un backend falso

- **Ubicación:** `lib/supabase.ts`
- **Hallazgo:** Si faltan PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY, el cliente usa "https://mock.supabase.co" y "mock-key" sin avisar. En producción la app puede fallar en silencio o aparentar funcionar.
- **Recomendación:** Lanzar un error claro durante el build o al iniciar si faltan las variables. Quitar el fallback.

### A16 · Alto · Datos de demostración que se ven como reales

- **Ubicación:** `pages/app/inicio.astro; perfil.astro; comprobantes.astro; data/mock.ts`
- **Hallazgo:** Inicio muestra fijos 3 inscritos, 2 cursos y 3 constancias. Perfil muestra "3 eventos" y la inicial "M". Comprobantes siempre está vacío. La constancia del 1er Congreso de Neurodesarrollo tiene fecha 24 de mayo de 2026, antes de que se celebrara. Los eventos 3 y 4 tienen las mismas fechas y sede. Una actividad con fecha límite del 15 de julio sigue pendiente sin indicar que venció.
- **Recomendación:** Confirmar los datos con el equipo y reemplazarlos por datos reales. Mientras tanto, marcarlos como ejemplo o quitarlos del flujo público.

### M1 · Medio · Texto de 9 a 10 px en 13 lugares

- **Ubicación:** `EventCard, Badge, inicio, cursos, reservaciones y LiveBanner`
- **Hallazgo:** Etiquetas de tarjetas, badges, fechas de actividades y la leyenda "DÍAS / HORAS" usan text-[9px] o text-[10px]. En móvil es difícil de leer y no cumple las recomendaciones de tamaño mínimo.
- **Recomendación:** Usar un mínimo de 12 px (text-xs) para texto de lectura. Reservar 10 px solo para etiquetas decorativas.

### M2 · Medio · Cuentas regresivas calculadas al compilar

- **Ubicación:** `FeaturedHero.astro; congresos/[id].astro`
- **Hallazgo:** daysUntil() se ejecuta en el build, así que "Faltan N días" queda fijo hasta el siguiente deploy. El countdown de inicio sí se actualiza en el cliente, por lo que los dos valores pueden no coincidir.
- **Recomendación:** Calcular los días en el cliente, o mostrar la fecha en lugar de la cuenta fija.

### M3 · Medio · Código duplicado

- **Ubicación:** `LogoutButton.tsx y LogoutButtonProfile.tsx; cabeceras en 5 páginas; filtros en congresos, galería y cursos`
- **Hallazgo:** Dos componentes de logout casi idénticos. Las cabeceras se repiten en cinco páginas con estilos distintos (congresos/[id], cursos/[id], en-vivo, checkout). La lógica de filtros de chips se repite en tres páginas.
- **Recomendación:** Un solo componente de cabecera (PageHeader) con variantes y un util compartido para los filtros.

### M4 · Medio · Colores fuera del sistema de diseño

- **Ubicación:** `ProgressBar.astro, LivePlayer.tsx, VideoPlayer.tsx, CheckoutForm.tsx, varias páginas`
- **Hallazgo:** Se encontraron unos 53 colores hexadecimales inline en vez de tokens del @theme, y clases de la paleta por defecto de Tailwind (green-100, red-100, orange-100, gray-100).
- **Recomendación:** Reemplazar por tokens (success, error, secondary, surface…) para que el tema sea consistente y se pueda cambiar en un solo lugar.

### M5 · Medio · Reservaciones: contenido que se corta en móvil

- **Ubicación:** `pages/app/reservaciones.astro`
- **Hallazgo:** Los pasos usan position absolute dentro de un contenedor con min-h-[360px] y overflow-hidden. Con el teclado virtual abierto o en pantallas bajas, el paso 3 (textarea y botones) puede quedar cortado.
- **Recomendación:** Usar un flujo normal (sin absolute) o una altura dinámica. Probar con el teclado abierto en 375 px.

### M6 · Medio · Accesibilidad de componentes interactivos

- **Ubicación:** `cursos/[id].astro (acordeón); congresos (chips); configuración (diálogo); LoginForm (errores)`
- **Hallazgo:** Los acordeones no tienen aria-expanded. Los chips de filtro no tienen aria-pressed. El diálogo de eliminar cuenta no tiene role="dialog", no se cierra con Esc y no maneja el foco. Los errores de login no tienen role="alert". En todo el código hay solo 7 atributos aria. No hay enlace para saltar al contenido ni se respeta prefers-reduced-motion.
- **Recomendación:** Agregar los atributos ARIA, manejo de foco en los diálogos, enlace "Saltar al contenido" y regla para reducir movimiento. Probar con teclado y lector de pantalla.

### M7 · Medio · Controles táctiles menores a 44 px

- **Ubicación:** `VideoPlayer.tsx (controles); TopBar y botones de cabecera`
- **Hallazgo:** Los controles del reproductor (p-1 con icono de 20 px, unos 28 px) y los botones de cabecera (p-2 con icono de 24 px, unos 40 px) quedan por debajo del mínimo recomendado de 44 px.
- **Recomendación:** Dar al menos 44 × 44 px de área táctil a todos los controles, con p-2.5 o min-h y min-w.

### M8 · Medio · Fuentes externas que bloquean el render

- **Ubicación:** `components/layouts/BaseLayout.astro`
- **Hallazgo:** Poppins y Material Symbols (la fuente variable completa) se cargan desde Google Fonts. Retrasan el primer render y dependen de un tercero.
- **Recomendación:** Autohospedar las fuentes, subsetearlas a los caracteres usados y precargar la que se muestra primero.

### M9 · Medio · Imágenes sin dimensiones y con hotlinking

- **Ubicación:** `data/mock.ts; EventCard, galería, cursos`
- **Hallazgo:** Varias imágenes vienen de Unsplash (sin licencia documentada para producción) y no declaran width y height, lo que causa saltos de diseño (CLS).
- **Recomendación:** Descargar las imágenes, optimizarlas (WebP o AVIF) y declarar dimensiones. Reemplazarlas por material de Grupo Fénix si es posible.

### M10 · Medio · Barras fijas que reducen el área útil

- **Ubicación:** `pages/app/congresos/[id].astro`
- **Hallazgo:** El hero de 288 px más la barra de precio fija dejan poco espacio para el contenido en teléfonos de 375 × 667 px.
- **Recomendación:** Reducir el hero a unos 200 px o convertirlo en encabezado compacto al hacer scroll.

### M11 · Medio · Anchos máximos inconsistentes

- **Ubicación:** `AppLayout (max-w-2xl), checkout (max-w-md), en-vivo (max-w-4xl), configuración (max-w-xl)`
- **Hallazgo:** Cada pantalla usa un ancho distinto. En tablet y escritorio la barra de navegación inferior queda centrada a 672 px.
- **Recomendación:** Definir un contenedor único y decidir si la app se diseña solo para móvil o también para escritorio.

### M12 · Medio · Fallos posibles sin fallback

- **Ubicación:** `pages/app/cursos/[id].astro; components/events/EventCard.astro`
- **Hallazgo:** course.modules.map se usa sin fallback: si falta el arreglo, la página falla. En EventCard, {speakers_count && …} renderizaría un "0" visible si el dato fuera 0.
- **Recomendación:** Validar los datos antes de renderizar y usar condicionales explícitos (speakers_count > 0 ? … : null).

### M13 · Medio · Tipos débiles y tipos sin uso

- **Ubicación:** `AuthGuard.tsx (as any); types/index.ts; en-vivo/[id].astro`
- **Hallazgo:** Hay as any en AuthGuard y en en-vivo. Tipos sin uso: LiveStream, Order, Enrollment, Product, ReservationRequest. FilterTab dice "Finalizados" pero el código usa "Finalizado".
- **Recomendación:** Unificar los modelos con el esquema real de Supabase, eliminar any y los tipos que no se usan.

### M14 · Medio · Sin pruebas ni chequeo de tipos en el pipeline

- **Ubicación:** `package.json; .github/workflows/main.yml`
- **Hallazgo:** No hay scripts de test, lint ni check. @astrojs/check está instalado pero no tiene script. El workflow crea PRs automáticos sin compilar ni probar.
- **Recomendación:** Agregar "astro check" y build en CI, y pruebas E2E con Playwright en viewports de 375, 390 y 430 px.

### B1 · Bajo · Subida de source maps

- **Ubicación:** `wrangler.jsonc`
- **Hallazgo:** upload_source_maps: true sube los mapas de código fuente a Cloudflare.
- **Recomendación:** Decidir si se quiere (útil para depurar errores) y documentarlo.

### B2 · Bajo · Comentarios de desarrollo en el workflow

- **Ubicación:** `.github/workflows/main.yml`
- **Hallazgo:** Hay un comentario "AQUÍ VAN LOS PERMISOS QUE TE PIDIERON" que parece de una prueba.
- **Recomendación:** Limpiar los comentarios temporales.

### B3 · Bajo · README describe funciones que aún no existen

- **Ubicación:** `README.md`
- **Hallazgo:** Describe PWA, Stripe, Owncast y la estructura de rutas como si estuvieran listos.
- **Recomendación:** Agregar una sección "Estado" con lo implementado y lo pendiente.

### B4 · Bajo · Variable declarada y sin uso

- **Ubicación:** `.env.example (PUBLIC_OWNCAST_BASE_URL)`
- **Hallazgo:** La variable está en .env.example pero ningún archivo la lee.
- **Recomendación:** Usarla en la integración de Owncast o eliminarla.

### B5 · Bajo · Botones "Atrás" con javascript:history.back()

- **Ubicación:** `TopBar.astro; checkout/error.astro`
- **Hallazgo:** Si la página se abre directamente desde un enlace, history.back() no lleva a ningún lado. Además el href javascript: impide una CSP estricta.
- **Recomendación:** Usar un enlace a la ruta padre o un botón con onClick que haga history.back() solo si hay historial.

### B6 · Bajo · Doble botón de cerrar sesión en Perfil

- **Ubicación:** `pages/app/perfil.astro`
- **Hallazgo:** Perfil tiene el icono de logout en la cabecera y un segundo botón "Cerrar sesión" en la página. Además, showLogout oculta el engranaje de Configuración.
- **Recomendación:** Dejar un solo punto para cerrar sesión y restaurar el acceso a Configuración.

### B7 · Bajo · Archivos y clases sin uso

- **Ubicación:** `components/ui/Spinner.astro; Icon.astro; src/assets/*.svg; reservaciones (clase delay-100)`
- **Hallazgo:** Spinner.astro e Icon.astro no se usan. Hay SVG de plantilla (astro.svg, background.svg) y la clase delay-100 no está definida.
- **Recomendación:** Eliminar lo que no se usa o usarlo de forma consistente.

## 5. Revisión móvil y responsividad

| Ancho o dispositivo | Qué revisar |
| --- | --- |
| 320 px (teléfono pequeño o Android económico) | Accesos rápidos de 4 columnas, chips que se desplazan, estadísticas de 3 columnas, textos de 9 a 10 px. |
| 375 px (iPhone SE, 13 mini) | Cabecera con safe-area (A10), barra inferior, hero del congreso con barra de precio fija (M10), formularios con teclado abierto (M5). |
| 390 a 414 px (iPhone 12 a 15, Android medio) | Pasos de reservaciones, formulario de checkout y registro (A5), reproductor y controles táctiles (M7). |
| 430 px en adelante y tablet de 768 px | Ancho máximo y centrado (M11), barra inferior en tablet, galería en dos columnas. |
| iPhone con la app instalada (modo standalone) | Barra de estado, safe-area superior e inferior, orientación, comportamiento sin conexión (A11). |
| Pruebas transversales | Zoom al 200 % (WCAG 1.4.4), navegación solo con teclado, lector de pantalla, Lighthouse móvil. La app no tiene modo oscuro: decidir si se requiere. |

## 6. Plan de corrección por fases

| Fase | Hallazgos | Criterio de salida |
| --- | --- | --- |
| Fase 0: Contención | C1, C3, A2, A3, A4, A6, A12, A16 | Ninguna vista muestra pagos, transmisiones o confirmaciones falsas, y no hay enlaces rotos ni datos de prueba como reales. |
| Fase 1: Bloqueantes de lanzamiento | C2, C4, A1, A5, A7, A8, A9, A10, A11, A13, A14, A15 | Pago de prueba de Stripe de principio a fin; fechas correctas en cualquier zona; contraste AA; PWA instalable; cabeceras de seguridad activas. |
| Fase 2: Calidad de UI/UX y móvil | M1 a M14, B1 a B7 | Revisión en 320, 375, 390 y 430 px sin errores visuales; Lighthouse de accesibilidad de 90 o más. |
| Fase 3: Integraciones | Sin ID propio (trabajo de datos) | Datos reales de Supabase para progreso, inscripciones y constancias; Owncast con control de acceso; recuperación de contraseña completa; pruebas E2E de compra, inscripción, reproducción y recuperación. |

## 7. Estado en la rama `dev` (0f33cd3)

La rama `dev` tiene 13 commits que no están en `main`. Revisión puntual de los hallazgos:

- **Corregido parcialmente:** A10 (cabecera con `safe-area` en checkout y en vivo) y M7 (área táctil de 44 px en algunas cabeceras).
- **Sin cambios:** C1 (el checkout sigue simulando el pago), C2 (no hay adaptador de Cloudflare), C4 (`/app/reset-password` no existe), A5 (el campo de registro sigue perdiendo el foco), A13 (`_headers` sin cabeceras de seguridad), A14 (`pr-validation.yaml` sigue en la raíz).
- **Nuevo, prioridad crítica (N1):** los endpoints `src/pages/api/admin/*` no verifican autenticación. `GET /api/admin/users` devuelve todos los perfiles y `POST /api/admin/lives` inserta cualquier cuerpo, ambos con la clave anónima de Supabase. Solo sería seguro si las reglas RLS de Supabase lo bloquean, lo cual no se pudo verificar. El workflow `main.yml` abre un PR automático de `dev` a `main`, así que este riesgo podría llegar a `main` sin revisión.

## 8. Preguntas abiertas para el equipo

- ¿Qué cuenta de Stripe se usará (prueba o producción), quién la administra y se cobrará IVA en el checkout?
- ¿Owncast ya está desplegado? ¿Qué URL usará PUBLIC_OWNCAST_BASE_URL?
- ¿Existe el proyecto de Supabase con tablas (events, orders, enrollments, user_progress) y reglas RLS configuradas?
- ¿Los eventos del catálogo son reales? Revisar fechas, sedes, los eventos 3 y 4 con las mismas fechas y la constancia fechada antes del evento.
- ¿El reproductor será con video propio, Owncast u otra plataforma?
- ¿Las imágenes de Unsplash pueden reemplazarse por material de Grupo Fénix?
- ¿La app debe funcionar sin conexión y poder instalarse?
- ¿Se requiere modo oscuro?
