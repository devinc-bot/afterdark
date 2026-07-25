# DOMAIN.md — Repo

Business context and product rules. Schema detail → `packages/db/DATABASE.md`. Layout → `ARCHITECTURE.md`.

---

## Product

**Repo** — plataforma de eventos (ubicaciones, eventos, entradas).

| Audience | App         | Role                                           |
| -------- | ----------- | ---------------------------------------------- |
| Cliente  | `web`       | Cuenta, descubrir/comprar entradas             |
| Dueño    | `dashboard` | Ubicaciones, eventos, tickets, staff, settings |
| Staff    | `dashboard` | Operación en ubicación (invitación + panel)    |

Misma DB Turso; tipos/validators compartidos.

> Legacy specs under `spec/features/` may still say “club” / “nightlife”; treat those as historical until the feature is next touched. Canonical venue language here is **location**.

---

## Roles

| Role    | Quién              | Alta                                   |
| ------- | ------------------ | -------------------------------------- |
| `user`  | Cliente            | `web` → `/register`                    |
| `owner` | Dueño de ubicación | `dashboard` → `/register`              |
| `staff` | Personal           | Invitación del dueño (`/$name/$token`) |
| `admin` | Plataforma         | Fuera de alcance UI actual             |

---

## Core entities

| Entity                     | Idea                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `Account` + `Role`         | Credenciales; un account puede vincularse a perfil user/owner/staff |
| `User` / `Owner` / `Staff` | Perfiles por rol                                                    |
| `Location`                 | Venue/local del dueño (+ address, assets); permanente o temporal    |
| `Event`                    | Evento en una ubicación                                             |
| `Ticket`                   | Tipo de entrada de un evento                                        |
| `Order` / `tickets_sold`   | Compra / entrada vendida                                            |
| `StaffInvitation`          | Invite pendiente/aceptada                                           |

IDs: `documentId` (UUID) en API/JWT; `id` (int) solo para FKs internas.

Enums/DTOs → `@repo/types`. Validación → `@repo/validators`. No redefinir en apps.

---

## Product rules

- **UI copy en español** (vía `@repo/i18n`). Identifiers/código en **inglés**.
- Validar con Zod de `@repo/validators` antes de persistir.
- Dueño gestiona sus ubicaciones/eventos/tickets/staff; cliente no administra inventario.
- Staff entra solo por invitación del dueño (no registro libre de staff).
- Auth: JWT + refresh; sesión vía `GET /session/me`.
