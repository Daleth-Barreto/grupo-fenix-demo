# Análisis para pasar a App Android/iOS con Capacitor

## Estado actual
- Framework: Astro 6 + React 19 + Tailwind 4
- Auth: Supabase (email/password)
- Pagos: Stripe
- Video en vivo: Owncast + hls.js
- Deploy: Cloudflare Pages (adapter @astrojs/cloudflare)
- Sin Capacitor configurado aún

## Inventario de módulos en la app
| Ruta | Tipo | Notas para móvil | Viabilidad |
|---|---|---|---|
| `/app/login`, `/app/registro`, `/app/recuperar` | Auth | Funciona en WebView. Requiere guardar sesión (Supabase). | Alta |
| `/app/inicio` | Home | UI responsive (ya hay mejoras móviles FASE A). | Alta |
| `/app/cursos`, `/app/cursos/[slug]` | Cursos | Listado + detalle. Requiere acceso por inscripción. | Alta |
| `/app/congresos`, `/app/congresos/[slug]` | Congresos/Eventos | Similar a cursos. | Alta |
| `/app/en-vivo`, `/app/en-vivo/[id]` | En vivo | Usa hls.js + Owncast. En iOS WKWebView puede requerir configuración. | Media-Alta (probar) |
| `/app/checkout/[tipo]/[slug]` | Checkout | Stripe Elements/Checkout. Funciona en WebView pero mejor con Stripe PaymentSheet nativo. | Media (mejorar con plugin) |
| `/app/comprobantes`, `/app/comprobantes/[id]` | Comprobantes | PDFs/descarga. | Alta |
| `/app/constancias` | Constancias | Descarga/generación. | Alta |
| `/app/perfil`, `/app/configuracion` | Perfil | CRUD básico. | Alta |
| `/app/reservaciones` | Reservaciones | Funcionalidad existente. | Alta |
| `/app/galeria` | Galeria | Imágenes. | Alta |
| `/admin/*` | Admin | Panel completo. Funciona pero mejor como web. Puede restringirse en app. | Media (opcional) |

## Compatibilidad con Capacitor

### Lo que funciona bien
- Astro con output estático/SSR adaptado? Actualmente usa Cloudflare adapter. Para app nativa conviene output `static` o usar `@astrojs/node` + servir, o mejor usar `astro capacitor` approach / convertir a SPA con rutas client.
- React components se ejecutan en WebView sin problema
- Tailwind funciona
- Supabase JS funciona en WebView
- hls.js funciona en Android WebView; en iOS WKWebView hay restricciones

### Posibles problemas
| Problema | Impacto | Solución |
|---|---|---|
| Cloudflare adapter no apto para bundle nativo | Alto | Cambiar a `output: 'static'` + rutas con `client:load` o usar `@capacitor/assets`. Alternativa: build estático y servir con Capacitor. |
| Stripe en WebView | Medio | Usar `@capacitor-community/stripe` o redirigir a Stripe Checkout (funciona). |
| Cookies/Sessions en WebView | Medio | Supabase usa localStorage - OK. Revisar `SameSite`. |
| Deep linking | Bajo | Configurar `@capacitor/app` para rutas |
| Status bar / Safe areas | Bajo | Ya hay mejoras en CSS (FASE A). Usar `@capacitor/status-bar` |
| Push notifications | Futuro | `@capacitor/push-notifications` |

## Plan de migración a Android/iOS

### Fase M1: Preparación
- [ ] Crear rama `feature/capacitor-mobile`
- [ ] Instalar Capacitor: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
- [ ] Configurar `capacitor.config.ts` (appId, appName, webDir)
- [ ] Decidir output: **Recomendado** `output: 'static'` para máxima compatibilidad con WebView
- [ ] Ajustar `astro.config.mjs` (remover o condicionar cloudflare adapter)

### Fase M2: Build y assets
- [ ] `astro build` a `dist/`
- [ ] `npx cap init`
- [ ] `npx cap add android && npx cap add ios`
- [ ] Generar iconos/splash con `@capacitor/assets`
- [ ] Configurar `Info.plist` (NSAppTransportSecurity) y `AndroidManifest.xml`

### Fase M3: Plugins nativos
- [ ] `@capacitor/status-bar` - Ajustar status bar
- [ ] `@capacitor/splash-screen` - Splash screen
- [ ] `@capacitor/keyboard` - Comportamiento teclado
- [ ] `@capacitor/app` - Deep links / back button
- [ ] `@capacitor/browser` - Abrir URLs externas mejor

### Fase M4: Pruebas
- [ ] Auth en Android Emulator / iOS Simulator
- [ ] Cursos y progreso
- [ ] Checkout Stripe
- [ ] Video en vivo HLS
- [ ] Safe areas y teclado
- [ ] Deep linking
- [ ] Build release APK/IPA

## Recomendaciones
- **Viabilidad general: ALTA** - La app está bien estructurada para WebView
- **Más crítico:** Cambiar adapter de Cloudflare a static para Capacitor
- **En vivo:** Probar hls.js en iOS (puede necesitar `playsInline`, `muted`)
- **Stripe:** Considerar PaymentSheet nativo para mejor UX
- **Admin:** Puede excluirse del build móvil o mantenerlo (funciona)

## Comandos sugeridos
```bash
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm i @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard @capacitor/app @capacitor/browser
npx cap init
npx cap add android
npx cap add ios
npm run build
npx cap sync
npx cap open android
npx cap open ios
```
