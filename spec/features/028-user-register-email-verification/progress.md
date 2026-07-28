# Progreso de entrevista — `user-register-email-verification`

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

### Fase 1–6

Recreada desde entrevista ya aprobada en este hilo (archivos previos ausentes del repo).

- ID `028`, apps `api`+`web`+`dashboard`, deps `001`/`018`/`019` (ref `021`).
- Endpoints user: `request` + `confirm` (hechos en web).
- **Ampliación 2026-07-28 (confirmada por usuario):** mismo flujo para **owner** en dashboard.
  - Endpoints `register/owner/request` + `confirm`.
  - Tabla `owner_registration_tokens`.
  - Link `{DASHBOARD_URL}/register/confirm?token=…` → sesión + `/dashboard`.
  - Paridad TTL 60 / 10/día / Google intacto / UI error vencido sin “ya verificado”.
- Spec `approved`; plan y tasks actualizados.
- **Ajuste:** no incluir generación/aplicación de migraciones; schema + repos (+ `db:push` en local si hace falta).

---

## Supuestos del asistente

- Sync de tablas nuevas en DB local vía `db:push` (o migración aparte del equipo), no `db:generate`/`db:migrate` en `028`.
- El archivo `apps/dashboard/.../dashboard.tsx` (panel KPI) **queda fuera de alcance**; el trabajo es auth register/confirm.
