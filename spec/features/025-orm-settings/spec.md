# Configuración del ORM (Drizzle)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor              |
| ---------- | ------------------ |
| **ID**     | `025-orm-settings` |
| **Status** | `done`             |
| **Apps**   | `db`               |

---

## Qué hace

Al generar migraciones con Drizzle Kit (`db:generate`), los archivos nuevos se nombran con prefijo timestamp (p. ej. `20260716210900_….sql`) en lugar de un índice secuencial.

## Por qué

Con prefijos `0001`, `0002`, … dos desarrolladores que generan migraciones en ramas distintas suelen colisionar en el mismo número al mergear. El timestamp reduce esas colisiones en el equipo.

## Alcance

### Incluye

- Configurar `migrations.prefix: 'timestamp'` en `packages/db/drizzle.config.ts`
- Documentar el convenio en `packages/db/DATABASE.md` (y mención breve en docs de agentes si ya describen migraciones)

### No incluye

- Renombrar o reescribir migraciones existentes (`0000`…`0020`)
- Cambiar dialecto, credentials, schema o el flujo de `migrate` / `push`
- Automatizar resolución de colisiones si dos migraciones se generan en el mismo segundo

---

## User stories

### US-1: Prefijo timestamp al generar

**Como** desarrollador  
**Quiero** que `db:generate` use timestamps en el nombre del archivo  
**Para** poder mergear migraciones de ramas en paralelo sin pelear por el mismo índice (`0021`)

**Criterios de aceptación**

- [ ] **Dado** el repo con `migrations.prefix = 'timestamp'`, **cuando** corro `db:generate` con un cambio de schema, **entonces** el `.sql` nuevo empieza con timestamp (`YYYYMMDDHHmmss_…`) y no con el siguiente índice secuencial
- [x] **Dado** las migraciones `0000`…`0020` en el repo, **cuando** genero una nueva, **entonces** esas existentes no se renombran ni se reescriben

---

## Contratos

### API

No aplica (sin endpoints).

### Datos

| Tabla / campo | Cambio |
| ------------- | ------ |
| — | Sin cambios de schema. Solo naming de archivos de migración nuevos vía drizzle-kit. |

### UI

No aplica.

**Config (DX)**

| Archivo | Cambio |
| ------- | ------ |
| `packages/db/drizzle.config.ts` | `migrations: { prefix: 'timestamp' }` |
| `packages/db/DATABASE.md` | Documentar convenio de prefijos |
| `AGENTS.md` | Una línea: nuevas migraciones usan prefijo `timestamp` |

---

## Reglas de negocio

1. Toda migración **nueva** se genera con `prefix: 'timestamp'`; no volver a `index` sin acuerdo del equipo.
2. No renombrar migraciones ya commiteadas (ni `0000`…`0020` ni timestamps posteriores).
3. Colisión el mismo segundo: resolución manual en el merge (renombrar/regenerar una).
4. `db:push` sigue siendo solo dev; el prefijo no cambia ese flujo.

## Preguntas abiertas

Ninguna.
