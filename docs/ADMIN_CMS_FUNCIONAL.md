# Panel Admin CMS - Funcional

## Implementado

### Esquema y datos
- Migración `20251029_cms_base_schema` aplicada con tablas, enums, índices, triggers y RLS
- Tipos en `src/types/database.types.ts`
- Funciones helper: `is_admin()`, `is_admin_or_instructor()`

### CRUD funcional
| Módulo | Listado | Crear | Editar/Acción | API |
|---|---|---|---|---|
| Eventos / Congresos | Sí | Sí | Eliminar | `/api/admin/events/*` |
| Usuarios / Roles | Sí | - | Cambiar rol | `/api/admin/users/*` |
| Transmisiones en Vivo (Owncast) | Sí | Sí | Poner en vivo / Finalizar / Eliminar | `/api/admin/lives/*` |
| Cursos | UI lista | UI base | Pendiente (constructor) | Pendiente |
| Inscripciones / Órdenes | UI lista | Pendiente | Pendiente | Pendiente |
| Constancias | UI lista | Pendiente | Pendiente | Pendiente |
| Biblioteca de Medios | UI lista | Pendiente | Pendiente | Pendiente |
| Configuración | UI lista | Pendiente | Pendiente | Pendiente |

## Rutas
- `/admin` Dashboard
- `/admin/eventos`, `/admin/eventos/nuevo`
- `/admin/usuarios`
- `/admin/en-vivo`, `/admin/en-vivo/nuevo`
- `/admin/cursos`, `/admin/cursos/nuevo`
- `/admin/inscripciones`
- `/admin/constancias`
- `/admin/medios`
- `/admin/configuracion`

## Commits
- `feat(admin): completar páginas del panel CMS` 
- `feat(db): esquema CMS base`
- `feat(admin): CRUD eventos funcional`
- `feat(admin): gestor de usuarios con cambio de rol`
- `feat(admin): gestor transmisiones en vivo`

## PR
- #19: feat(admin): Fase B - Panel CMS completo (hacia `dev`)
