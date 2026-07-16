# Progreso de entrevista — `orm-settings`

> Estado de la entrevista guiada ([INTERVIEW.md](../../INTERVIEW.md)). Actualizar al cerrar cada fase.

| Fase | Nombre                   | Estado |
| ---- | ------------------------ | ------ |
| 1    | Identidad                | `done` |
| 2    | Comportamiento y alcance | `done` |
| 3    | User stories             | `done` |
| 4    | Contratos                | `done` |
| 5    | Reglas y cierre          | `done` |
| 6    | Plan técnico             | `done` |

Estados: `pending` · `in_progress` · `done`

---

## Log de respuestas

### Fase 1 — Identidad

- Feature nueva: `025-orm-settings`
- Título: Configuración del ORM (Drizzle)
- Slug: `orm-settings`
- Paquete: `packages/db` (no apps de producto)
- Prefijo de migraciones: `timestamp` (opción A)
- Migraciones existentes (`0000`…`0020`): se dejan intactas; solo las nuevas usan timestamp
- Dependencias: ninguna

### Fase 2 — Comportamiento y alcance

- Qué hace: `db:generate` nombra migraciones nuevas con prefijo `timestamp`
- Por qué: evitar conflictos de merge por índices secuenciales en paralelo
- Incluye: `drizzle.config.ts` + docs (`DATABASE.md`; mención en AGENTS si aplica)
- No incluye: renombrar migraciones viejas; cambiar dialect/credentials/schema/migrate/push; automatizar colisiones de timestamp mismo segundo

### Fase 3 — User stories

- US-1: desarrollador genera migraciones con prefijo timestamp; existentes intactas
- Sin historia extra de onboarding/docs (docs van en alcance, no como US)

### Fase 4 — Contratos

- API/UI/schema: N/A
- Config: `migrations.prefix = 'timestamp'`
- Docs: `DATABASE.md` + una línea en `AGENTS.md`

### Fase 5 — Reglas y cierre

- Reglas DX 1–4 (solo timestamp en nuevas; no renombrar; colisión mismo segundo a mano; push sin cambios)
- Preguntas abiertas: ninguna
- Status → `approved` (usuario: continúa)

### Fase 6 — Plan técnico

- Plan/tasks: config + docs; verificación con generate o inspección de config
- Usuario confirma o pide implementar

---

## Supuestos del asistente

- Al decir «continúa» en fase 5: se aprueba la spec y se redacta el plan.
