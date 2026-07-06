# Roadmap

> Orden de las features. Una fila = una carpeta en `spec/features/`.

| #   | Slug                               | Título                               | Status        | Apps                      | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------- | ------------------------------------ | ------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 | `auth-sessions`                    | Autenticación y sesiones             | `in-progress` | `api`, `web`, `dashboard` | Login, registro user/owner, JWT + refresh, `GET /session/me`. Dashboard integrado; `web` con rutas auth, sesión por cerrar.                                                                                                                                                                                                                                                                                                                  |
| 002 | `club-management`                  | Gestión de clubes                    | `in-progress` | `api`, `dashboard`        | CRUD de clubes del dueño (`/clubs/*`). Dashboard en `/club-management` conectado a API.                                                                                                                                                                                                                                                                                                                                                      |
| 003 | `staff-invitations`                | Staff e invitaciones                 | `in-progress` | `api`, `dashboard`        | Entrega 1: listado personal (`GET /staff/my-personnel`). Entrega 2 (en spec): listado invitaciones del dueño. `POST /invitations/staff` existe; falta aceptación y PATCH de estado.                                                                                                                                                                                                                                                          |
| 004 | `owner-settings`                   | Perfil y configuración del dueño     | `done`        | `api`, `dashboard`        | `GET/PATCH /owners/*` consolidado en nuevo módulo `settings` (`SettingsService`, dispatch por rol del JWT). `modules/owner/` → `modules/settings/owner/`; nuevo `modules/settings/staff/` (placeholder "Hello World"). `role` NO viaja en `SessionResponse` — se obtiene de `GET /settings`. Owner puede cargar dirección en `/settings` (`owner_addresses_lnk`). Verificado en browser + API real. Ver `spec/features/004-owner-settings/`. |
| 005 | `club-assets`                      | Medios de clubes                     | `draft`       | `api`, `dashboard`        | Módulo `files` + R2; tablas `assets` y `club_assets_lnk`. Pendiente enlazar subida/galería al flujo de clubes.                                                                                                                                                                                                                                                                                                                               |
| 006 | `tickets`                          | Entradas y tipos de ticket           | `draft`       | `api`, `dashboard`        | Esquema `tickets` listo; dashboard en `/tickets` con datos mock. Falta API, repositorio y CRUD real.                                                                                                                                                                                                                                                                                                                                         |
| 007 | `web-catalog`                      | Catálogo público                     | `draft`       | `api`, `web`              | Descubrimiento de clubes/eventos para clientes. Sustituye el placeholder `properties` en `web`.                                                                                                                                                                                                                                                                                                                                              |
| 008 | `checkout-payments`                | Compra y pagos                       | `draft`       | `api`, `web`              | Tabla `payments` y módulo `orders` (stub). Checkout de entradas y estados de pago.                                                                                                                                                                                                                                                                                                                                                           |
| 009 | `operational-chat`                 | Chat operativo                       | `paused`      | `api`, `dashboard`, `web` | Esquema `chat` / `messages`. Pausado hasta cerrar catálogo y checkout.                                                                                                                                                                                                                                                                                                                                                                       |
| 010 | `club-create-edit-page`            | Formulario club en pantalla completa | `approved`    | `dashboard`               | Rutas `/club-management/new` y `/:documentId/edit`. Spec lista para implementar.                                                                                                                                                                                                                                                                                                                                                             |
| 011 | `events-management`                | Gestión de eventos (dashboard)       | `in-progress` | `api`, `dashboard`        | CRUD eventos en `/events`. Depende de `002`.                                                                                                                                                                                                                                                                                                                                                                                                 |
| 012 | `ticket-form-event-and-sale-dates` | Ticket: evento + ventana de venta    | `approved`    | `api`, `dashboard`        | Select evento requerido; fechas de venta opcionales en modal ticket. Depende de `011`.                                                                                                                                                                                                                                                                                                                                                       |
| 013 | `language-switcher`                | Selector de idioma                   | `in-progress` | `dashboard`               | Select mock "Idioma del panel" conectado a `setLanguage()` real de `@afterdark/i18n`. Type-check/lint OK; falta QA manual en browser (login como dueño). `web` queda afuera (sin header aún).                                                                                                                                                                                                                                                |
| 014 | `staff-settings`                   | Configuración del staff              | `done`        | `api`, `dashboard`        | Reemplaza el placeholder "Hello World" de `StaffSettingsView` (004) por edición real de perfil (nombre, apellido, teléfono; avatar/email solo lectura). `BaseProfileResponse`/`baseProfileSchema` compartidos entre owner y staff; `createSettingsFormProvider<TUser,TProfile>()` genérico en `modules/settings/`. Verificado en browser (Playwright) contra API real. Ver `spec/features/012-staff-settings/`.                              |

## Status

| Valor         | Significado            |
| ------------- | ---------------------- |
| `draft`       | Spec en progreso       |
| `approved`    | Listo para implementar |
| `in-progress` | Implementación activa  |
| `done`        | Entregado y verificado |
| `paused`      | Pausado a propósito    |

## Dependencias

```text
001-auth-sessions       →  (sin deps)
002-club-management     →  requiere 001
003-staff-invitations   →  requiere 001, 002
004-owner-settings      →  requiere 001
005-club-assets         →  requiere 002
006-tickets             →  requiere 002
007-web-catalog         →  requiere 002, 006 (listado público con entradas publicadas)
008-checkout-payments   →  requiere 001, 006, 007
009-operational-chat    →  requiere 001, 002 (opcional: 008)
010-club-create-edit-page →  requiere 002
011-events-management                →  requiere 002
012-ticket-form-event-and-sale-dates →  requiere 011
013-language-switcher                →  requiere 004 (settings del dueño)
014-staff-settings                   →  requiere 004 (módulo settings), 003 (modelo de datos staff)
```

## Decisiones de prioridad

1. **Operaciones del dueño antes que descubrimiento público** — sin clubes, entradas y staff estables en `dashboard`, el catálogo `web` no tiene datos ni procesos de soporte.
2. **Auth transversal primero** — staff, dueños y clientes comparten cuentas, roles y sesiones; todo lo demás depende de guards y JWT coherentes.
3. **Tickets antes que checkout** — hay que definir tipos, stock y ventanas de venta antes de cobrar; `payments` cuelga del modelo de `tickets`.
4. **Assets después de clubes** — las imágenes y medios se asocian a un club existente; el módulo `files` ya existe pero no bloquea el CRUD base.
5. **Chat al final** — útil para operación, pero no desbloquea el flujo principal descubrir → comprar → operar; se mantiene en `paused` hasta tener catálogo y pagos acotados.
