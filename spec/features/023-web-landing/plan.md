# Plan de implementación — Landing web

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.

## Orden de capas

```text
1. packages/i18n (keys landing)
2. apps/web (landing UI + sesión)
```

Sin cambios en validators, types, db ni api.

## Archivos a crear / modificar

### i18n

| Archivo                                     | Cambio                                         |
| ------------------------------------------- | ---------------------------------------------- |
| `packages/i18n/src/locales/landing/es.json` | `nav.events`, `nav.tickets`, `nav.accountAria` |
| `packages/i18n/src/locales/landing/en.json` | Idem EN                                        |

### Client (`web`)

| Archivo                                                                                    | Cambio                                                    |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `apps/web/app/modules/landing/components/landing-page.tsx`                                 | Header y CTAs condicionados por `useSession`; avatar auth |
| Opcional: `apps/web/app/modules/landing/components/landing-header-actions.tsx` (o similar) | Extraer bloque derecha del header si el JSX crece         |

## Diseño técnico

1. En `LandingPage`, llamar `useSession()` (carga IDLE → `loadSession`).
2. Derivar flags:
   - `isAuthenticated`
   - `showAuthCtas` = guest (no autenticado y no “loading con token”)
   - `showAvatarSlot` = autenticado o (loading + cookie token)
3. Detectar token con `getCookieSync({ name: COOKIE_KEYS.accessToken })` (mismo patrón que el store).
4. Header:
   - Guest: Cómo funciona / Noches + Login / Register
   - Auth: Eventos / Tickets (span/`aria-disabled`) + `Avatar` de `@repo/ui` (imagen o iniciales)
5. Hero + closing: renderizar CTAs solo si `showAuthCtas`.
6. Patrón de avatar alineado al dashboard (`Avatar` / `AvatarImage` / `AvatarFallback`).

## Riesgos / edge cases

| Caso               | Comportamiento esperado                                       |
| ------------------ | ------------------------------------------------------------- |
| Flash guest → auth | Mitigar con cookie: ocultar CTAs durante loading si hay token |
| 401                | Store → unauthenticated; UI guest                             |
| Error de red       | UI guest                                                      |
| Sin avatar URL     | Iniciales de `name` + `lastName`                              |

## Verificación manual

| Paso                    | Resultado esperado                                       |
| ----------------------- | -------------------------------------------------------- |
| 1. Sin sesión en `/`    | Nav marketing + Login/Register en header, hero y closing |
| 2. Login y volver a `/` | Eventos/Tickets + avatar; sin CTAs auth                  |
| 3. Avatar sin foto      | Iniciales visibles                                       |
| 4. Token inválido       | Vuelve a UI guest sin toast                              |
