# Tasks — Pantallas create/edit club + mapa

> Checklist. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista ampliación (fases 1–5) `done`
- [x] `spec.md` status `approved` (mapa + ajustes IP / sin autocomplete-geocode)
- [x] `plan.md` actualizado (2026-07-16)
- [x] `progress.md` log de ajustes post-implementación
- [x] `roadmap.md` actualizado

## packages/db

- [x] Añadir `latitude` / `longitude` nullable (`real`) en `addresses`
- [x] Generar y aplicar migración (`0020_equal_shaman`)
- [x] Actualizar `create-club-with-address` / `update-club-with-address`

## packages/validators · types · common · i18n

- [x] Extender `createClubSchema` con `latitude` / `longitude`
- [x] `ClubResponse` + `GeoIpLocateResult`
- [x] `API_ROUTES.geo.ipLocate`
- [x] Keys i18n (mapa, IP locate, validación coords, errores geo)
- [x] Retirar schemas/rutas/DTOs de autocomplete y geocode

## apps/api — clubs

- [x] Persistir y devolver lat/lng en create / update / my-clubs

## apps/api — geo

- [x] Módulo `geo` con `GET /api/geo/ip-locate` (ipquery + rate-limit + client IP)
- [x] Retirar Photon / autocomplete / geocode

## packages/ui — mapcn

- [x] `@mapcn/map` en `packages/ui`
- [x] Exportar Map / Marker desde `@afterdark/ui`

## apps/dashboard

- [x] `fetchIpLocation` + botón IP junto a Ciudad
- [x] `club-location-map.tsx` (mapcn, pin click/drag, geo browser + fallback BA)
- [x] Integrar en `club-form.tsx` (lat/lng, isDirty, FormData)
- [x] Edit: carga con `useClubs()` en cliente (sin loader SSR)
- [x] Retirar autocomplete UI y auto-geocode

## Calidad

- [x] Type-check (api / dashboard / packages afectados)
- [ ] `pnpm lint` / format
- [ ] Verificación manual según `plan.md`
- [ ] Criterios US-7…US-9 de `spec.md`

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md` tras QA manual
