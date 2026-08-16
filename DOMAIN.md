# DOMAIN.md — Repo

Business context and product rules. Schema detail → `packages/db/DATABASE.md`. Layout → `ARCHITECTURE.md`.

---

## Product

**Repo** — plataforma de eventos (ubicaciones, eventos, entradas).

| Audience | App         | Role                                                         |
| -------- | ----------- | ------------------------------------------------------------ |
| Cliente  | `web`       | Cuenta, descubrir/comprar entradas                           |
| Dueño    | `dashboard` | Organización, ubicaciones, eventos, tickets, staff, settings |
| Staff    | `dashboard` | Operación en organización (invitación + panel)               |

Misma DB Turso; tipos/validators compartidos.

> Legacy specs under `spec/features/` may still say “club” / “nightlife”; treat those as historical until the feature is next touched. Canonical venue language here is **location**.

---

## Roles

| Role    | Quién        | Alta                                   |
| ------- | ------------ | -------------------------------------- |
| `user`  | Cliente      | `web` → `/register`                    |
| `owner` | Dueño/gestor | `dashboard` → `/register`              |
| `staff` | Personal     | Invitación del dueño (`/$name/$token`) |
| `admin` | Plataforma   | Fuera de alcance UI actual             |

---

## Core entities

| Entity                     | Idea                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `Account` + `Role`         | Credenciales; un account puede vincularse a perfil user/owner/staff |
| `User` / `Owner` / `Staff` | Perfiles por rol                                                    |
| `Organization`             | Identidad comercial (nombre y tax ID) compartida por sus accounts   |
| `OrganizationAccount`      | Membresía N:M entre organizaciones y accounts                       |
| `Location`                 | Venue/local del dueño (+ address, assets); permanente o temporal    |
| `Event`                    | Evento de una organización celebrado en una ubicación               |
| `Ticket`                   | Tipo de entrada de un evento                                        |
| `Order` / `tickets_sold`   | Compra / entrada vendida                                            |
| `StaffInvitation`          | Invite pendiente/aceptada, emitida por owner para una organización  |

IDs: `documentId` (UUID) en API/JWT; `id` (int) solo para FKs internas.

Enums/DTOs → `@repo/types`. Validación → `@repo/validators`. No redefinir en apps.

---

## Product rules

- **UI copy en español e inglés** (vía `@repo/i18n`). Identifiers/código en **inglés**. Dark y light mode son first-class.
- Validar con Zod de `@repo/validators` antes de persistir.
- Los flujos owner actuales requieren exactamente una organización asociada, aunque el esquema admite membresías N:M.
- Los eventos pertenecen directamente a una organización y usan una ubicación como venue; una organización puede tener muchos eventos.
- Dueño gestiona la organización, ubicaciones, eventos, tickets y staff; cliente no administra inventario.
- Staff entra solo por invitación del dueño (no registro libre de staff). La aceptación crea su membresía con la organización invitante.
- El acceso y la gestión de staff se autorizan por membresía de organización; no existe relación directa staff-location.
- Auth: JWT + refresh; sesión vía `GET /session/me`.
