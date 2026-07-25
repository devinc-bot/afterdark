# Tasks — Perfil y configuración del dueño (+ settings de staff)

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–6 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada actualizada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `packages/types/src/api.ts`: `SessionResponse` **sin cambios** (no lleva `role`)
- [x] `packages/types/src/api.ts`: `CurrentOwnerResponse` agrega `role: typeof USER_ROLE.OWNER`; nuevo `StaffSettingsResponse` + `SettingsResponse` union
- [x] Sin cambios en `@repo/validators` (se reusa `updateCurrentOwnerSchema`)
- [x] Sin cambios en `packages/db` (sin schema/migración nueva)

## API

- [x] `session.service.ts`: **sin cambios** (no incluye `role`, decisión revertida)
- [x] Nuevo módulo `apps/api/src/modules/settings/` (`settings.module.ts`, `settings.controller.ts`, `settings.service.ts`, `index.ts`)
- [x] `SettingsController`: `GET /settings` + `PATCH /settings`, `JwtAuthGuard`, `ZodValidationPipe(updateCurrentOwnerSchema)` en PATCH
- [x] `SettingsService`: dispatch por `role` — owner resuelto con lógica propia (ex-`OwnerService`, consolidada acá), staff devuelve `{ role: 'staff' }` (GET) / no-op (PATCH), otro rol → `ForbiddenException`
- [x] Eliminar `apps/api/src/modules/owner/` completo (controller + module + service, sin otro consumidor)
- [x] `app.module.ts` + `modules/index.ts`: quitar `OwnerModule`, registrar `SettingsModule`

## Client (dashboard)

- [x] `app/config/constants/api.ts`: quitar `owners.*`/`API_OWNERS_PREFIX`/`currentOwner()`, agregar `settings.*`
- [x] Nuevo `app/modules/settings/services/settings.service.ts` (`fetchSettings`/`updateSettings` sobre `/settings`); `modules/common/services/owner.service.ts` queda solo con `toSessionUser`
- [x] Nuevo `app/modules/settings/queries/use-settings.ts` (`useSettings`/`useSettingsSuspense`), reemplaza `use-current-user.ts` (eliminado)
- [x] Mover `app/modules/owner/**` → `app/modules/settings/owner/**` (components, constants, hooks, services, utils)
- [x] Actualizar imports internos rotos por el move (`~/modules/owner/...` → `~/modules/settings/owner/...`)
- [x] `update-current-user.service.ts`: delega en `settings.service.ts` (`updateSettings`)
- [x] Renombrar `settings-view.tsx` → `owner-settings-view.tsx` (`OwnerSettingsView`), recibe `owner` como prop (ya no hace fetch propio)
- [x] Nuevo `app/modules/settings/staff/components/staff-settings-view.tsx` (placeholder `PageLayout` + i18n "Hello World")
- [x] Nuevo `app/modules/settings/components/settings-view.tsx` (dispatcher: un solo `useSettings()`, discrimina por `data.role`)
- [x] Mover `settings-form-states.tsx` → `modules/settings/components/settings-load-states.tsx` (loading/error genéricos del dispatcher)
- [x] `app/routes/_app/settings.tsx`: import apunta al nuevo dispatcher
- [x] Refactor extra (pedido durante la implementación): `settings-form-context.tsx` dividido en hooks — `useSettingsFormValues` (settings/owner), `useUnsavedChangesGuard` + `useAutoDismiss` (common, reutilizables)
- [x] **Reestructuración adicional (pedido explícito del usuario, post-verificación):** `modules/settings/owner/` → `modules/owner/` (top-level, sin colisión). El placeholder de `modules/settings/staff/` se fusionó dentro de `modules/staff/` **ya existente** (gestión de personal), no quedó como módulo propio. `modules/settings/` quedó solo con el despachador + fetch compartido. `settings-view.tsx` ahora importa de `~/modules/owner` y `~/modules/staff` (módulos hermanos) — se aparta a propósito de la regla de no-imports-entre-hermanos de `ARCHITECTURE.md`.

## i18n

- [x] `packages/i18n/src/locales/settings/es.json` + `en.json`: anidado bajo `owner.*` / `staff.*`; `page.metaTitle`, `messages.loading`, `messages.loadErrorTitle`, `actions.retryLoad` quedan compartidos (top-level) para el dispatcher
- [x] Agregar `staff.page.title` / `staff.placeholder` ("Hello World", es + en)
- [x] Actualizar todos los `t('page...')` / `t('sections...')` / `t('profile...')` / `t('actions...')` / `t('messages...')` en `modules/settings/owner/**` → prefijo `owner.*`

## Calidad

- [x] `pnpm type-check` (api, dashboard, types en verde; `apps/web` falla por un error preexistente sin relación — `properties` módulo placeholder, fuera de esta spec)
- [x] `pnpm lint` (oxlint, 0 errores)
- [x] `pnpm format` (oxfmt sobre los archivos tocados)
- [x] `pnpm check:i18n` (36 keys es/en, paridad OK)
- [x] Verificación manual en browser (Playwright contra dev servers reales de `api` + `dashboard`, con usuarios de prueba owner/staff/user creados vía la API): owner ve el formulario de perfil completo; staff ve `PageLayout` + "Hello World"; ambos disparan `GET /api/settings` (y `GET /api/session/me`, sin `role`); cero errores de consola, cero fallos de red; sin ninguna llamada a `/api/owners/*`. Verificado también por API directa: `GET/PATCH /settings` owner (200, persiste), staff (200, no-op), rol `user` (403 `forbidden`), sin token (401).
- [x] Criterios de aceptación de `spec.md` cumplidos (US-1, US-2)

## Cierre

- [x] Status → `done` en `spec.md` y `roadmap.md`

---

## Ampliación (2026-07-04) — Dirección del owner

### Spec & plan

- [x] Entrevista de la ampliación completa (`progress.md`, fases 2–5 en `done`)
- [x] `spec.md` actualizado, status `approved`
- [x] `plan.md` con sección de ampliación
- [x] `roadmap.md` actualizado (fila 004)

### DB

- [x] `packages/db/src/schema/owner-address-lnk.ts` (nuevo, mirror de `club-address-lnk.ts`)
- [x] Eliminar `packages/db/src/schema/user-address-lnk.ts`
- [x] `packages/db/src/schema/index.ts`: swap export
- [x] `packages/db/DATABASE.md`: catálogo de tablas, diagrama, índices únicos actualizados
- [ ] `pnpm --filter @repo/db db:generate` (migración) — **bloqueado**: falta `src/migrations/meta/0010_snapshot.json` en el repo (pre-existente, no relacionado a esta feature; confirmado con `git log` que nunca se commiteó). `drizzle-kit generate` no corre para ninguna migración nueva hasta que se resuelva. Usuario decidió arreglarlo aparte, fuera de esta sesión.
- [x] `owners.repository.ts`: `findCurrentOwnerByDocumentId` suma `address`; nueva `upsertOwnerAddress`

### Shared packages

- [x] `packages/validators/src/owner.ts`: `ownerAddressSchema` + `updateCurrentOwnerSchema.address`
- [x] `packages/types/src/api.ts`: `CurrentOwnerResponse.address`
- [x] `packages/i18n`: clave `field.address.cannotClear` (es + en) — `settings.owner.profile.address*` (copy de labels) ya existía sin usar

### API

- [x] `owner.service.ts`: `getCurrentOwner` incluye `address`; `updateCurrentOwner` valida "no vaciar" y delega en `upsertOwnerAddress`

### Client (dashboard)

- [x] `settings-form-context.tsx` (genérico): soporta bloque `address` anidado en `profile.address` vía `setNestedProfileField` (en vez de un bloque hermano top-level, ver nota en `plan.md`/log)
- [x] `settings-form-values.formatter.ts` (owner): `toOwnerFormValues` incluye `address`
- [x] `profile-settings-section.tsx` (owner): sección "Domicilio" con 4 inputs

### Calidad

- [x] `pnpm type-check` (api, dashboard, db, validators, types, i18n) — todos en verde
- [x] `pnpm lint` (oxlint, 0 errores)
- [x] `pnpm check:i18n` (paridad es/en OK)
- [ ] Verificación manual en browser — **bloqueada** por la migración pendiente (la DB local no tiene `owner_addresses_lnk` todavía)

### Cierre

- [ ] Status ampliación → reflejar en `spec.md`/`roadmap.md` una vez corrida la migración y verificado en browser
