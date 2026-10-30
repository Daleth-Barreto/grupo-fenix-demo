# TODO - Grupo Fénix

## Estado General
- [x] FASE 0: Infraestructura base (env, Stripe unificado, API routes, build)
- [x] FASE 1: Autenticación, sesión, guards, recuperar contraseña, logout
- [x] FASE 2: Comprobantes, pantallas post-checkout, webhook base, tipos Order/Enrollment
- [x] FASE 3: Progreso de cursos, marcar completada, protección rutas
- [x] FASE 4: Video en vivo con Owncast + hls.js, LivePlayer, LiveBanner
- [x] FASE A: Mejoras móviles (safe areas, touch targets, formularios, reproductor, checkout)

## Pendiente

### FASE B: CMS / Panel Administrativo (Prioritario)
- [ ] Crear estructura `/admin` con `AdminLayout.astro`
- [ ] Sistema de roles (student/instructor/admin) + guards por rol
- [ ] Dashboard con KPIs
- [ ] CRUD Eventos/Congresos
- [ ] Constructor de Cursos (módulos/lecciones/actividades/recursos)
- [ ] Gestor de Transmisiones en Vivo (Owncast)
- [ ] Gestor de Usuarios
- [ ] Inscripciones/Órdenes
- [ ] Biblioteca de medios (Supabase Storage)
- [ ] Emisión de constancias
- [ ] Configuración

### FASE C: UI/UX General
- [ ] Design tokens unificados
- [ ] Componentes reutilizables (Card, Modal, Sheet, Input, Toast, Skeleton)
- [ ] Bottom sheets para móvil
- [ ] Skeletons de carga
- [ ] Sistema de toasts
- [ ] Accesibilidad (prefers-reduced-motion, aria)
- [ ] Pulir estados vacíos

### Backend / Producción
- [ ] Completar webhook de Stripe (crear orden/inscripción)
- [ ] Implementar control de acceso a cursos/comprobados
- [ ] Persistir progreso en Supabase
- [ ] RLS completo
- [ ] Migraciones Supabase versionadas
- [ ] Subir `.env.example` ya está, pero revisar variables
- [ ] Generar tipos desde Supabase

### App Móvil (Capacitor)
- [ ] Configurar Capacitor (ios/android)
- [ ] Probar auth en WebView
- [ ] Probar Stripe en WebView
- [ ] Probar HLS en iOS WKWebView / Android WebView
- [ ] Ajustes para status bar

## Notas
- `USUARIOS_PRUEBA.md` está en `.gitignore`
- Usar Owncast (gratis) para video en vivo
- Stripe en modo test para desarrollo
- Build y `astro check` pasando
