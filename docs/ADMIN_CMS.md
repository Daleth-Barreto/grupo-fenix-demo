# Panel Administrativo - Grupo Fénix

## Estado
Implementado en `feature/fenix-admin-cms`. FASE B en progreso.

## Estructura

```
src/
├── components/admin/
│   └── AdminGuard.tsx        # Protección por rol (admin/instructor)
├── layouts/
│   └── AdminLayout.astro    # Layout con sidebar, header, responsive
└── pages/admin/
    ├── index.astro          # Dashboard con KPIs y accesos rápidos
    ├── cursos/
    │   ├── index.astro      # Listado de cursos
    │   └── nuevo.astro      # Constructor de cursos (módulos/lecciones)
    ├── eventos/
    │   ├── index.astro      # Listado de eventos/congresos
    │   └── nuevo.astro      # Formulario creación evento
    ├── en-vivo/
    │   ├── index.astro      # Listado transmisiones Owncast
    │   └── nuevo.astro      # Configuración transmisión
    ├── usuarios/
    │   └── index.astro      # Gestión de usuarios
    ├── inscripciones/
    │   └── index.astro      # Órdenes/inscripciones
    ├── constancias/
    │   └── index.astro      # Emisión de constancias
    ├── medios/
    │   └── index.astro      # Biblioteca de medios
    └── configuracion/
        └── index.astro      # Configuración general
```

## Características

- **Guard por rol**: Solo `admin` e `instructor` pueden acceder
- **Layout responsive**: Sidebar colapsable en móvil
- **Accesos rápidos**: Desde dashboard a crear evento/curso/transmisión
- **Estados vacíos**: Listados preparados para conectar con Supabase
- **Owncast**: Preparado para gestión de transmisiones en vivo

## Próximos pasos

- Conectar CRUD con Supabase (tablas: events, courses, modules, lessons, lives)
- Implementar constructor funcional de cursos
- Gestión real de usuarios y roles
- Subida de archivos a Supabase Storage
- Sistema de inscripciones/órdenes
- Generación de constancias
