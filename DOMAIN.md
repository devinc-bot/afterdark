# DOMAIN.md — afterdark

Business context and product rules. Schema detail → `packages/db/DATABASE.md`. Layout → `ARCHITECTURE.md`.

---

## Product

**afterdark** — plataforma de eventos nocturnos (clubes, eventos, entradas).

| Audience | App         | Role |
| -------- | ----------- | ---- |
| Cliente  | `web`       | Cuenta, descubrir/comprar entradas |
| Dueño    | `dashboard` | Clubes, eventos, tickets, staff, settings |
| Staff    | `dashboard` | Operación en club (invitación + panel) |

Misma DB Turso; tipos/validators compartidos.

---

## Roles

| Role    | Quién | Alta |
| ------- | ----- | ---- |
| `user`  | Cliente | `web` → `/register` |
| `owner` | Dueño del club | `dashboard` → `/register` |
| `staff` | Personal | Invitación del dueño (`/$name/$token`) |
| `admin` | Plataforma | Fuera de alcance UI actual |

---

## Core entities

| Entity | Idea |
| ------ | ---- |
| `Account` + `Role` | Credenciales; un account puede vincularse a perfil user/owner/staff |
| `User` / `Owner` / `Staff` | Perfiles por rol |
| `Club` | Local del dueño (+ address, assets) |
| `Event` | Evento en un club |
| `Ticket` | Tipo de entrada de un evento |
| `Order` / `tickets_sold` | Compra / entrada vendida |
| `StaffInvitation` | Invite pendiente/aceptada |

IDs: `documentId` (UUID) en API/JWT; `id` (int) solo para FKs internas.

Enums/DTOs → `@afterdark/types`. Validación → `@afterdark/validators`. No redefinir en apps.

---

## Product rules

- **UI copy en español** (vía `@afterdark/i18n`). Identifiers/código en **inglés**.
- Validar con Zod de `@afterdark/validators` antes de persistir.
- Dueño gestiona sus clubes/eventos/tickets/staff; cliente no administra inventario.
- Staff entra solo por invitación del dueño (no registro libre de staff).
- Auth: JWT + refresh; sesión vía `GET /session/me`.
