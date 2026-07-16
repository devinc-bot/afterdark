# Progreso de entrevista — `010-club-create-edit-page`

> [INTERVIEW.md](../../INTERVIEW.md)

| Fase | Nombre                   | Estado    |
| ---- | ------------------------ | --------- |
| 1    | Identidad                | `done`    |
| 2    | Comportamiento y alcance | `done`    |
| 3    | User stories             | `done`    |
| 4    | Contratos                | `done`    |
| 5    | Reglas y cierre          | `done`    |
| 6    | Plan técnico             | `done`    |

> **Nota:** fases 1–6 originales estaban `done` / spec `approved`. Se reabrieron fases 2–6 solo para la **ampliación** (mapa + lat/lng). El alcance previo (pantallas create/edit) permanece vigente.

---

## Log de respuestas

### Fase 1 — Identidad (original)

- **Relación:** mejora UX de `002-club-management`.
- **Apps:** solo `dashboard`; sin API nueva.
- **Rutas:** `/club-management/new` y `/club-management/$documentId/edit`.
- **Cancelar con cambios:** diálogo de confirmación.

### Fase 1 — Identidad (ampliación mapa · 2026-07-15)

- **Relación:** ampliar `010` (no feature nueva).
- **Apps:** `dashboard` + `api` + columnas lat/lng en `addresses` (opción B).
- **Dependencias:** `002-club-management` + base de `010` (correcto).
- **Librería:** [mapcn](https://www.mapcn.dev/docs) (MapLibre + patrón shadcn).

### Fase 2 — Comportamiento y alcance (ampliación mapa · 2026-07-15)

- **Qué hace:** al cargar/seleccionar dirección → mapa se posiciona solo; pin arrastrable para precisión; coords se guardan.
- **Por qué:** ubicación exacta más allá del texto de dirección.
- **Incluye (inicial):** mapcn, geocoding, pin drag, autocomplete gratuito, geo browser + fallback, lat/lng en `addresses`, coords requeridas al submit.
- **No incluye:** mapa en listado/web; providers de pago; reverse geocode al mover el pin; cambio de layout 2 cols.
- **Centro inicial create:** geolocalización del browser con fallback Buenos Aires.

### Alcance acotado — auto-ubicación por IP (2026-07-15)

- Botón de ubicación por IP ([ipquery](https://ipquery.io/#docs)) vía `GET /api/geo/ip-locate`.
- Ubicación UI final: botón al lado del input **Ciudad** (no autocomplete, no overlay del mapa).
- Al ubicar por IP: actualiza lat/lng (+ ciudad/estado si el provider los envía) y centra el mapa.
- IP privada/local → el backend resuelve la IP de egreso del provider.

### Ajustes post-implementación (2026-07-16) — pedido del usuario

- **Eliminado** autocomplete de direcciones (UI + `GET /api/geo/autocomplete` + Photon suggestions).
- **Eliminado** forward geocode (`GET /api/geo/geocode`, Photon adapter, auto-geocode en edit/blur).
- Ubicación del mapa: campos de dirección manuales + pin (click/drag) + **ubicación por IP** + geolocalización browser en create.
- Edit: carga club con `useClubs()` en cliente (sin loader SSR con `ensureQueryData`) para evitar `Unauthorized` sin cookie en SSR.
- Módulo `geo` en API queda solo con `ip-locate` + rate-limit.

### Fase 3 — User stories (ampliación mapa · 2026-07-15)

- US-1 a US-6 se mantienen.
- **US-7 (vigente):** ubicación aproximada por IP → mapa + pin; mensaje si falla.
- **US-8:** pin arrastrable / click; geo browser en create; edit con coords guardadas.
- **US-9:** persistir lat/lng; requeridas al submit.

### Fase 4 — Contratos (vigente tras ajustes)

- Clubs create/update/my-clubs: `latitude` / `longitude`.
- Proxy geo: solo `GET /api/geo/ip-locate` (JWT owner).
- `addresses.latitude` / `longitude` nullable (`real`).
- Lat/lng hidden (solo mapa).

### Fase 5 — Reglas y cierre

- Spec `approved` / implementación `in-progress` hasta QA manual.
- Edge cases: pin drag no reescribe texto; IP locate puede rellenar ciudad/estado; isDirty con coords; create/edit exigen pin; rate-limit en `ip-locate`.

### Fase 6 — Plan técnico

- Ver `plan.md` actualizado (sin Photon/autocomplete/geocode).

---

## Supuestos del asistente

- Patrón de rutas igual a `newProperty` / `editProperty` en `DASHBOARD_ROUTES`.
- `useBlocker` de TanStack Router para navegación con cambios sin guardar.
- Breakpoint dos columnas: `lg+`.
- Fallback create sin geo browser: Buenos Aires `[-58.3816, -34.6037]`.
- Proveedor IP: [ipquery](https://ipquery.io/#docs) (sin API key).
