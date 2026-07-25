# Panel del staff (rol staff)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor              |
| ---------- | ------------------ |
| **ID**     | `017-staff-panel`  |
| **Status** | `approved`         |
| **Apps**   | `dashboard`, `api` |

---

## Qué hace

Cuando un usuario con rol **staff** inicia sesión en el dashboard, ve un panel operativo reducido: en el sidebar solo aparece **Panel** (más perfil y cerrar sesión). En `/dashboard` se muestra una tabla de **asistentes con entrada** al evento (datos mockeados por ahora) y un botón **Escanear** arriba a la izquierda (sin acción en esta entrega; a futuro escaneará QR de entradas en la puerta).

Los usuarios con rol **owner** no cambian: siguen viendo todas las opciones de navegación actuales (Panel, Clubes, Entradas, Eventos, Usuarios, etc.).

## Por qué

El staff necesita una vista operativa acotada para control de acceso en la puerta, sin exponerle la gestión del negocio (clubes, eventos, personal). Separar la navegación por rol reduce fricción y evita que el staff acceda por error a pantallas del dueño (la API sigue siendo la barrera de seguridad; el front solo adapta la UX).

Enlaza con `mission.md`: staff opera con permisos acotados según el club asignado.

## Alcance

### Incluye

- Exponer `role` en `SessionResponse` (`GET /session/me`) para que el dashboard pueda leer el rol con `useSession()` sin depender de `GET /settings`.
- Filtrar ítems del sidebar según rol: **staff** ve solo Panel (+ perfil en footer + cerrar sesión); **owner** mantiene el menú actual.
- Reutilizar la ruta `/dashboard` con contenido distinto según rol.
- Vista staff en Panel: tabla de asistentes con entrada (mock) + botón **Escanear** (placeholder, sin handler).
- Copy de UI en español.

### No incluye

- API real de asistentes / validación de entradas.
- Funcionalidad del escáner QR (solo botón visible).
- Cambios en la app `web`.
- Redirección forzada si un staff navega manualmente a rutas del dueño (p. ej. `/club-management`) — queda fuera salvo que se acuerde en fases siguientes.

## User stories

### US-1: Navegación acotada para staff

**Como** staff del club  
**Quiero** ver solo la opción **Panel** en el menú principal (además de mi perfil y cerrar sesión)  
**Para** enfocarme en el control de acceso sin distracciones de gestión del negocio

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión con rol `staff`, **cuando** veo el sidebar, **entonces** solo aparece **Panel** en la navegación principal (no Clubes, Entradas, Eventos ni Usuarios).
- [ ] **Dado** que inicié sesión con rol `staff`, **cuando** veo el footer del sidebar, **entonces** puedo acceder a mi perfil (`/settings`) y a **Cerrar sesión**.
- [ ] **Dado** que inicié sesión con rol `owner`, **cuando** veo el sidebar, **entonces** el menú se mantiene igual que hoy (Panel, Clubes, Entradas, Eventos, Usuarios).

### US-2: Panel operativo con asistentes (mock)

**Como** staff del club  
**Quiero** ver en **Panel** una tabla de asistentes con entrada al evento  
**Para** consultar quién tiene entrada válida antes de escanear en la puerta

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión con rol `staff`, **cuando** entro a `/dashboard`, **entonces** veo una tabla con columnas **Nombre**, **Evento** y **Estado de entrada**.
- [ ] **Dado** que la tabla no tiene filas (mock vacío), **cuando** se renderiza, **entonces** se muestra un mensaje de estado vacío en español (p. ej. «No hay asistentes para mostrar.»).
- [ ] **Dado** que inicié sesión con rol `owner`, **cuando** entro a `/dashboard`, **entonces** la vista del panel **no cambia** respecto a la actual.

### US-3: Botón Escanear (placeholder)

**Como** staff del club  
**Quiero** un botón **Escanear** visible arriba a la izquierda del panel  
**Para** identificar rápidamente la acción de control de acceso (aunque aún no esté implementada)

**Criterios de aceptación**

- [ ] **Dado** que inicié sesión con rol `staff`, **cuando** estoy en `/dashboard`, **entonces** veo el botón **Escanear** arriba a la izquierda del contenido principal.
- [ ] **Dado** que presiono **Escanear**, **cuando** ocurre el click, **entonces** no se ejecuta ninguna acción (sin modal, sin navegación, sin toast).

### US-4: Rol disponible en la sesión

**Como** desarrollador del dashboard  
**Quiero** que `GET /session/me` incluya el `role` del usuario  
**Para** filtrar navegación y vistas sin una llamada extra a `/settings`

**Criterios de aceptación**

- [ ] **Dado** un JWT válido de staff u owner, **cuando** llamo a `GET /session/me`, **entonces** la respuesta incluye `role` (`staff` u `owner`, según corresponda).
- [ ] **Dado** que el dashboard cargó la sesión, **cuando** uso `useSession()`, **entonces** puedo leer `user.role` para decidir qué menú y qué vista de panel mostrar.

---

## Contratos

### API

| Método | Ruta              | Auth | Cambio                                        |
| ------ | ----------------- | ---- | --------------------------------------------- |
| `GET`  | `/api/session/me` | JWT  | Agregar campo `role: UserRole` a la respuesta |

**Response** — extender `SessionResponse` en `@repo/types`:

```typescript
export interface SessionResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  role: UserRole // nuevo
}
```

El valor de `role` proviene del `JwtPayload` (ya presente en el token); `SessionService.getCurrentSession` debe incluirlo en el objeto retornado.

**Errores (sin cambios)**

| HTTP | Cuándo               | Mensaje (español, vía i18n)   |
| ---- | -------------------- | ----------------------------- |
| 401  | Sin JWT / inválido   | Según guard de auth existente |
| 404  | Perfil no encontrado | `auth.SESSION_NOT_FOUND`      |

No hay endpoints nuevos para la tabla de asistentes (datos mock en el cliente).

### Datos

| Tabla / campo | Cambio                                |
| ------------- | ------------------------------------- |
| —             | Sin cambios de esquema ni migraciones |

### UI

| Ruta                                                               | Rol     | Pantalla                                                                            |
| ------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `/dashboard`                                                       | `staff` | Panel operativo: botón **Escanear** (arriba izquierda) + tabla de asistentes (mock) |
| `/dashboard`                                                       | `owner` | Sin cambios respecto a la vista actual                                              |
| `/club-management/*`, `/tickets`, `/events`, `/staff`              | `staff` | **404** (página no encontrada) si accede por URL directa                            |
| Rutas exclusivas de staff (v1: ninguna URL aparte de `/dashboard`) | `owner` | **404** si en el futuro se agregan rutas solo-staff                                 |

**Protección de rutas (dashboard)**

- Usar `beforeLoad` en rutas del dueño: si `session.role === staff` → `throw notFound()`.
- Reutilizar el componente global `notFoundComponent` de `__root.tsx` (`RootNotFound`) o extraer un componente reutilizable si hace falta mostrar 404 dentro del shell autenticado.
- Definir constante de rutas permitidas por rol (p. ej. `OWNER_ROUTES`, `STAFF_ROUTES`) en `modules/common/constants/`.

**Tabla de asistentes (mock)**

| Columna           | Tipo / valores mock                            |
| ----------------- | ---------------------------------------------- |
| Nombre            | `string` — nombre completo del asistente       |
| Evento            | `string` — nombre del evento                   |
| Estado de entrada | `Válida` · `Usada` · `Expirada` (etiquetas UI) |

- Datos estáticos en el módulo dashboard (p. ej. `staff-panel.mock.ts`); sin búsqueda ni paginación.
- Estado vacío: mensaje «No hay asistentes para mostrar.»

**Copy (español)**

| Contexto                  | Texto                                                |
| ------------------------- | ---------------------------------------------------- |
| Botón escanear            | Escanear                                             |
| Columna nombre            | Nombre                                               |
| Columna evento            | Evento                                               |
| Columna estado            | Estado de entrada                                    |
| Estado: válida            | Válida                                               |
| Estado: usada             | Usada                                                |
| Estado: expirada          | Expirada                                             |
| Tabla vacía               | No hay asistentes para mostrar.                      |
| Título panel (staff)      | Panel                                                |
| Descripción panel (staff) | Consultá asistentes y escaneá entradas en la puerta. |

Claves i18n sugeridas bajo `dashboard` → `pages.panel.staff.*` y `pages.panel.staff.table.*`.

---

## Reglas de negocio

1. **Navegación por rol** — El sidebar se arma según `user.role` de `useSession()` (no `useSettings()`).
2. **Rutas del dueño** — Solo `owner` (y roles con permisos equivalentes en el futuro) acceden a `/club-management`, `/tickets`, `/events`, `/staff`. El `staff` que navegue por URL recibe **404**.
3. **Rutas del staff** — En v1 no hay URLs exclusivas del staff aparte del contenido distinto en `/dashboard`. Si se agregan, el `owner` recibe **404** al intentar accederlas.
4. **Seguridad** — El 404 en front es UX; la API sigue validando roles en cada endpoint (`RolesGuard`).
5. **Escanear** — Botón visible pero sin handler; no dispara toast ni modal.
6. **Mock** — Los asistentes son datos locales hasta que exista API de check-in / listado real.

## Preguntas abiertas

_(Ninguna — entrevista cerrada.)_
