# Landing web

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor             |
| ---------- | ----------------- |
| **ID**     | `023-web-landing` |
| **Status** | `approved`        |
| **Apps**   | `web`             |

---

## Qué hace

La landing de `web` adapta el header y los CTAs de auth según sesión: el guest ve navegación marketing + Login/Register; el cliente autenticado ve **Eventos** / **Tickets**, su avatar, y no ve botones de iniciar sesión ni registrarse en ninguna sección de la landing.

## Por qué

El cliente logueado debe ver atajos de producto e identidad, no CTAs de auth. Soporta el flujo post-login hacia catálogo/entradas (roadmap `007` / `006`) sin implementar esas pantallas aún. Depende de `001-auth-sessions`.

## Alcance

### Incluye

- Header guest: links actuales (Cómo funciona / Noches) + Login / Register
- Header autenticado: nav **Eventos** y **Tickets**; sin Login/Register; **avatar** del usuario (`session.avatar`, fallback a iniciales)
- En el resto de la landing: ocultar botones de iniciar sesión / registrarse cuando hay sesión
- i18n ES/EN para labels nuevos del nav autenticado
- Reutilizar sesión existente (`useSessionStore` / `GET /session/me`)

### No incluye

- Listado, detalle o compra real de eventos o tickets
- Menú completo de perfil (settings, historial, logout) salvo decisión en fases siguientes
- Cambios de contenido marketing de la landing fuera de CTAs de auth y del header nav
- Rutas/páginas nuevas de producto (catálogo / checkout)

---

## User stories

Roles: **guest** (sin sesión) y **cliente** autenticado (`user` en `web`). Owner/staff fuera de alcance de esta feature si llegan a la landing (se tratan como sesión autenticada genérica solo si `useSession` los reconoce; sin UI especial).

### US-1: Landing para visitante

**Como** visitante sin sesión  
**Quiero** ver la navegación marketing y los CTAs de Login/Register en header y secciones  
**Para** explorar la marca y poder autenticarme

**Criterios de aceptación**

- [ ] **Dado** que no hay sesión **Cuando** veo el header **Entonces** aparecen los links Cómo funciona / Noches y los botones Login y Register
- [ ] **Dado** que no hay sesión **Cuando** veo hero y closing **Entonces** aparecen los CTAs de crear cuenta / iniciar sesión

### US-2: Header autenticado

**Como** cliente con sesión  
**Quiero** ver Eventos, Tickets y mi avatar en el header (sin Login/Register)  
**Para** reconocer que estoy dentro y tener atajos de producto

**Criterios de aceptación**

- [ ] **Dado** sesión autenticada **Cuando** veo el header **Entonces** la nav muestra Eventos y Tickets (no Cómo funciona / Noches) y no hay Login/Register
- [ ] **Dado** sesión autenticada **Cuando** veo el header **Entonces** se muestra el avatar (`session.avatar`) o iniciales de nombre/apellido si no hay imagen

### US-3: Sin CTAs de auth en landing autenticada

**Como** cliente con sesión  
**Quiero** que no me muestren botones de Login/Register en las secciones de la landing  
**Para** no ser invitado a registrarme o iniciar sesión otra vez

**Criterios de aceptación**

- [ ] **Dado** sesión autenticada **Cuando** veo el hero **Entonces** no aparecen los CTAs de crear cuenta / iniciar sesión
- [ ] **Dado** sesión autenticada **Cuando** veo la sección closing **Entonces** no aparecen los CTAs de crear cuenta / iniciar sesión

---

## Contratos

### API (si aplica)

Sin endpoints nuevos. Reutiliza `GET /session/me` y sesión existente en `web`.

### Datos (si aplica)

Sin cambios de esquema.

### UI (si aplica)

| Ruta | Pantalla |
| ---- | -------- |
| `/`  | Landing (header + CTAs condicionados por sesión) |

**Copy**

| Contexto | ES | EN |
| -------- | -- | -- |
| Nav autenticada — eventos | Eventos | Events |
| Nav autenticada — tickets | Tickets | Tickets |
| Aria del avatar | Cuenta de {nombre} | Account for {name} |

**Interacción (supuestos confirmados con “ok” en fase 4)**

- **Eventos / Tickets:** visibles en nav; no navegan a rutas nuevas (elemento no navegable o `aria-disabled`) hasta catálogo.
- **Avatar:** solo presentación (sin menú / logout / perfil en este entregable).
- **Loading de sesión:** si hay token en cookie, ocultar CTAs de auth y mostrar placeholder/skeleton de avatar; si no hay token, UI guest.
- **Rutas nuevas:** ninguna.

---

## Reglas de negocio

- La variante autenticada se activa solo con `status === authenticated` y `user` presente.
- **401 / sesión inválida:** cookie limpiada (flujo actual de `fetchSession`); landing en UI guest; **sin toast**.
- **Error de red al cargar sesión:** tratar como **guest** (mostrar Login/Register); no bloquear la landing.
- Hero y closing autenticados: **solo ocultar CTAs** de auth; el copy marketing (headline/support) no cambia.
- Eventos/Tickets: visibles, no navegables hasta features de catálogo.
- Avatar: solo presentación; sin menú, logout ni perfil en este entregable.
- Loading con token en cookie: ocultar CTAs auth + skeleton/placeholder de avatar; sin token: UI guest.

## Preguntas abiertas

-
