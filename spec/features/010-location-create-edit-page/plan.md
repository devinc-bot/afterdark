# Plan de implementación — Pantallas create/edit club + mapa

> Complementa [spec.md](./spec.md). Status spec: `approved` / implementación `in-progress`.

## Estado

Base create/edit + mapa + lat/lng + **ip-locate** implementados. **Sin** autocomplete ni forward geocode (retirados por pedido del usuario, 2026-07-16).

## Orden de capas (histórico)

```text
1. packages/db          — addresses.latitude / longitude + migración
2. packages/validators  — createClubSchema coords
3. packages/types       — ClubResponse + GeoIpLocateResult
4. packages/common      — API_ROUTES.geo.ipLocate
5. packages/db repos    — create/update club address con coords
6. apps/api clubs       — persist + mapear lat/lng
7. apps/api geo         — módulo ip-locate (ipquery) + rate-limit
8. packages/ui          — mapcn Map / MapMarker
9. apps/dashboard       — mapa + botón IP + wiring form
10. Verificar type-check / QA manual
```

## Proveedores

| Uso              | Proveedor                           | Notas                          |
| ---------------- | ----------------------------------- | ------------------------------ |
| Tiles mapa       | CARTO (mapcn / MapLibre)            | Sin API key de pago            |
| Ubicación por IP | [ipquery](https://ipquery.io/#docs) | Proxy `GET /api/geo/ip-locate` |

Fallback create sin geo browser: **Buenos Aires** `[-58.3816, -34.6037]`.

## API — geo (vigente)

```text
apps/api/src/modules/geo/
├── presentation/geo.controller.ts      # solo ip-locate
├── application/
│   ├── locate-by-ip.use-case.ts
│   └── services/geo-rate-limit.service.ts
├── adapters/ipquery.locator.ts
├── utils/client-ip.ts
└── geo.module.ts
```

Auth: JWT owner. IP privada/local → locate sin IP (egress del server).

## Dashboard (vigente)

| Archivo                    | Rol                                                           |
| -------------------------- | ------------------------------------------------------------- |
| `club-location-map.tsx`    | mapcn, click-to-pin, pin draggable, geo browser + fallback BA |
| `club-form.tsx`            | Campos dirección + botón IP junto a Ciudad + mapa + FormData  |
| `service/geo.service.ts`   | `fetchIpLocation()` → `/api/geo/ip-locate`                    |
| `.../$documentId/edit.tsx` | `useClubs()` en cliente (sin loader SSR con token)            |

## Flujo ubicación

```text
create (mount)
  └─ geolocation browser?
       ├─ ok → set pin
       └─ deny/fail → BA fallback (sin pin obligatorio hasta colocar)

usuario pulsa “Ubicarme por IP”
  └─ GET /api/geo/ip-locate
       └─ set lat/lng (+ city/state si vienen) + flyTo + pin

usuario click / drag pin
  └─ set latitude/longitude only (drag no reescribe calle/número)

submit
  └─ Zod exige lat/lng → FormData → POST/PATCH clubs
```

## Riesgos / edge cases

| Caso                     | Mitigación                               |
| ------------------------ | ---------------------------------------- |
| Rate limit ipquery       | Rate-limit por cuenta en API             |
| SSR sin cookie JWT       | Edit carga clubs en cliente (`useClubs`) |
| Clubes legacy sin coords | Nullable DB; submit exige pin            |
| Bundle MapLibre          | Solo en form de club                     |

## Verificación manual

| Paso                          | Resultado esperado                                       |
| ----------------------------- | -------------------------------------------------------- |
| 1. Create: deny geo           | Mapa en BA fallback                                      |
| 2. Botón IP                   | Pin + coords; ciudad/estado si vienen                    |
| 3. Click / arrastrar pin      | Lat/lng cambian; calle/número intactos al drag           |
| 4. Guardar create             | Club con coords; edit muestra mismo pin                  |
| 5. Edit club viejo sin coords | Sin pin automático; usuario coloca pin; guardar persiste |
| 6. Submit sin pin             | Error _Seleccioná la ubicación en el mapa._              |
| 7. Full reload edit logueado  | Sin 500 Unauthorized                                     |
| 8. `pnpm type-check` + lint   | Verde                                                    |
