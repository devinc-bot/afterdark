# Arquitectura de tipos compartidos (DTOs)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor              |
| ---------- | ------------------ |
| **ID**     | `016-architecture` |
| **Status** | `approved`         |
| **Apps**   | `packages/types`   |

---

## Qué hace

Reorganiza `@afterdark/types` separando **enums y constantes de dominio** (`domain.ts`) de **interfaces y tipos de transferencia** (`src/dto/`), organizados por dominio de negocio.

## Por qué

Hoy `api.ts` concentra todos los response types y `domain.ts` mezcla enums con entidades (`User`, `Property`). Una carpeta `dto/` por dominio hace predecible dónde agregar tipos nuevos y alinea el paquete con módulos por dominio en API y dashboard.

## Alcance

### Incluye

- Crear `packages/types/src/dto/` con archivos por dominio.
- Mover todas las **interfaces** desde `api.ts`, `pagination.ts` y `domain.ts` hacia `dto/`.
- Dejar en `domain.ts` solo **enums, objetos const y tipos union derivados** (`UserRole`, `ClubStatus`, …).
- Eliminar `CurrentUserResponse` (alias deprecated sin consumidores).
- Mover `Property` a `dto/` con comentario de legacy (placeholder `web`); `PROPERTY_STATUS` permanece en `domain.ts`.
- Mantener re-exports en `index.ts` — sin cambios de import en apps consumidoras.
- Eliminar `api.ts` y `pagination.ts` tras la migración.

### No incluye

- Cambios en `apps/api`, `apps/dashboard` ni `apps/web` (salvo fallo de `type-check`).
- Refactor de `@afterdark/validators`, `@afterdark/db` o formatters.
- Otras iniciativas de arquitectura del monorepo (features separadas).

---

## User stories

### US-1: Ubicación predecible de DTOs

**Como** desarrollador del monorepo  
**Quiero** que cada DTO viva en un archivo por dominio bajo `dto/`  
**Para** encontrar y extender contratos sin abrir un `api.ts` monolítico

**Criterios de aceptación**

- [ ] **Dado** un tipo de respuesta de clubes, **cuando** busco su definición, **entonces** está en `dto/club.ts`.
- [ ] **Dado** un enum `ClubStatus`, **cuando** lo importo, **entonces** sale de `domain.ts` (no de `dto/`).

### US-2: Sin breaking change en consumidores

**Como** consumidor de `@afterdark/types` en API o apps  
**Quiero** seguir importando tipos desde el barrel del paquete  
**Para** no tocar decenas de archivos en esta entrega

**Criterios de aceptación**

- [ ] **Dado** un import existente `import { ClubResponse } from '@afterdark/types'`, **cuando** corro `pnpm type-check`, **entonces** compila sin cambios en el archivo consumidor.
- [ ] **Dado** la migración completa, **cuando** ejecuto `pnpm type-check` en la raíz, **entonces** no hay errores de tipos.

### US-3: Limpieza de legacy

**Como** mantenedor del paquete  
**Quiero** eliminar alias muertos y marcar entidades placeholder  
**Para** reducir deuda técnica visible

**Criterios de aceptación**

- [ ] **Dado** el refactor, **cuando** busco `CurrentUserResponse`, **entonces** no existe en el paquete.
- [ ] **Dado** `Property` en `dto/user.ts`, **cuando** leo su definición, **entonces** incluye nota de legacy / eliminación futura.

---

## Contratos

### Estructura de `packages/types`

```text
packages/types/src/
├── domain.ts              # enums + const + tipos union (sin interfaces)
├── dto/
│   ├── auth.ts            # LoginResponse, RegisterResponse, JwtPayload
│   ├── user.ts            # SessionResponse, perfiles, SettingsResponse, User, Property (legacy)
│   ├── club.ts            # ClubResponse, ClubImageResponse, UploadedAssetResponse
│   ├── event.ts           # EventResponse
│   ├── ticket.ts          # TicketResponse
│   ├── staff.ts           # invitaciones + StaffPersonnelItem
│   ├── common.ts          # ApiResponse, ApiError, PaginationParams, PaginatedResponse
│   └── index.ts           # re-export interno
└── index.ts               # export * domain + export * dto
```

### Mapeo desde archivos actuales

| Origen | Destino |
| ------ | ------- |
| `api.ts` → auth/session | `dto/auth.ts`, `dto/user.ts` |
| `api.ts` → club/asset | `dto/club.ts` |
| `api.ts` → event, ticket, staff | `dto/event.ts`, `dto/ticket.ts`, `dto/staff.ts` |
| `api.ts` → wrappers | `dto/common.ts` |
| `pagination.ts` | `dto/common.ts` |
| `domain.ts` → `User`, `Property` | `dto/user.ts` |
| `domain.ts` → enums | permanece en `domain.ts` |

### API / UI / Datos

Sin cambios de endpoints, pantallas ni esquema de base de datos.

---

## Reglas de negocio

- **Separación domain vs dto:** si es un `interface` o type alias de shape de datos → `dto/`; si es enum/const de dominio → `domain.ts`.
- **Barrel público:** `packages/types/src/index.ts` re-exporta todo; no se expone path `@afterdark/types/dto/...` a consumidores en esta entrega.
- **Imports internos en dto:** los archivos `dto/*.ts` importan enums desde `../domain.ts`.
- **Legacy `Property`:** se mantiene temporalmente en `dto/user.ts` con comentario `@deprecated` o nota JSDoc; eliminación cuando se retire el módulo `properties` de `web`.
- **Sin `CurrentUserResponse`:** usar `SessionResponse` directamente.

## Preguntas abiertas

- _(ninguna pendiente tras fase 2 — confirmar en fase 5)_
