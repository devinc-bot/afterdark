# Plan de implementación — Landing del dashboard

> Cómo se implementa `027-dashboard-landing`. Complementa `spec.md`.

## Orden de capas

```text
1. @repo/i18n  (namespace nuevo: dashboardLanding)
2. apps/dashboard   (módulo landing → componentes → ruta pública /)
```

Sin cambios en `validators`, `types`, `db` ni `api` (feature 100% UI + copy).

## Archivos a crear / modificar

### i18n (`packages/i18n`)

| Archivo                                 | Cambio                                                               |
| --------------------------------------- | -------------------------------------------------------------------- |
| `src/locales/dashboard-landing/es.json` | **Nuevo** — copy ES de todas las secciones                           |
| `src/locales/dashboard-landing/en.json` | **Nuevo** — copy EN                                                  |
| `src/config/namespaces.ts`              | Agregar `DASHBOARD_LANDING: 'dashboardLanding'` + a `ALL_NAMESPACES` |
| `src/loaders/client-loader.ts`          | Agregar entry `dashboardLanding` al `localeImports`                  |
| `src/loaders/server-loader.ts`          | Importar es/en + agregar a `SERVER_RESOURCES`                        |
| `src/types/index.ts`                    | Importar tipo es + agregar a `I18nResources`                         |

### dashboard (`apps/dashboard`)

| Archivo                                               | Cambio                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `app/modules/landing/components/landing-page.tsx`     | **Nuevo** — contenedor que compone header + secciones + footer                                    |
| `app/modules/landing/components/landing-header.tsx`   | **Nuevo** — marca + login/registro                                                                |
| `app/modules/landing/components/section-hero.tsx`     | **Nuevo**                                                                                         |
| `app/modules/landing/components/section-features.tsx` | **Nuevo** — ~4 beneficios                                                                         |
| `app/modules/landing/components/section-how.tsx`      | **Nuevo** — 3 pasos                                                                               |
| `app/modules/landing/components/section-social.tsx`   | **Nuevo** — testimonios cualitativos (sin números)                                                |
| `app/modules/landing/components/section-faq.tsx`      | **Nuevo** — ~4 preguntas                                                                          |
| `app/modules/landing/components/section-cta.tsx`      | **Nuevo** — cierre                                                                                |
| `app/modules/landing/components/landing-footer.tsx`   | **Nuevo** — links placeholder                                                                     |
| `app/modules/landing/constants/landing-content.ts`    | **Nuevo** — claves de listas (features, steps, testimonios, faq)                                  |
| `app/routes/index.tsx`                                | **Nuevo** — ruta pública `/`; `RequireGuest` + `LandingPage`                                      |
| `app/routes/_app/index.tsx`                           | **Eliminar** — evita conflicto de ruta `/`; el redirect a `/dashboard` ya lo cubre `RequireGuest` |

## Diseño técnico

- **Gate de sesión:** reutilizar `RequireGuest` (`modules/common`). Ya hace exactamente lo pedido: mientras carga → `SessionLoading`; autenticado → redirect a `DASHBOARD_ROUTES.home()`; guest → renderiza children (la landing). Cumple US-3 y las reglas de loading/error (error de red se resuelve como guest en `use-session`).
- **Ruta:** `routes/index.tsx` vive fuera de `_app`, por lo que es pública (sin `RequireSession`/`AppShell`). Se elimina `_app/index.tsx` para no duplicar el path `/`.
- **UI:** componentes de `@repo/ui` (`Button`, `Link`) + tokens CSS existentes (`bg-background`, `text-on-surface`, `text-on-surface-variant`, `border-hairline`, `primary`, etc.), consistentes con `auth-shell`. Sin video ni scroll-scrub.
- **Copy:** namespace `dashboardLanding`; `useTranslation('dashboardLanding')`. `usePageTitle('dashboardLanding', 'metaTitle')` para el título.
- **Composición:** `LandingPage` compone secciones explícitas (sin props booleanas). Listas (features/steps/faq/testimonios) se iteran desde constantes con claves i18n.
- **Accesibilidad:** landmarks (`header`/`main`/`section` con `aria-labelledby`/`footer`), foco visible, `prefers-reduced-motion` respetado en cualquier animación de entrada.

## Riesgos / edge cases

| Caso                                | Comportamiento esperado                                                |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Sesión cargando con token en cookie | `SessionLoading` (sin flash de landing) hasta resolver, luego redirect |
| Error de red al resolver sesión     | `use-session` deja status no autenticado → se muestra landing (guest)  |
| Staff autenticado entra a `/`       | Redirect a `/dashboard` (cualquier sesión válida)                      |
| Conflicto de ruta `/`               | Resuelto al eliminar `_app/index.tsx`                                  |

## Verificación manual

| Paso                                       | Resultado esperado                      |
| ------------------------------------------ | --------------------------------------- |
| 1. Sin sesión, ir a `/`                    | Se ve la landing completa (8 secciones) |
| 2. Click "Crear cuenta" / "Iniciar sesión" | Navega a `/register` / `/login`         |
| 3. Logueado como dueño, ir a `/`           | Redirige a `/dashboard` sin ver landing |
| 4. Cambiar idioma (EN)                     | Copy de la landing cambia a inglés      |
| 5. `pnpm type-check` + `pnpm lint`         | Sin errores                             |
