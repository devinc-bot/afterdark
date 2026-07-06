# Plan de implementación — Selector de idioma

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.
> Fase 6 hecha directo — el usuario pidió implementar antes de cerrar formalmente fase 5 (ver `progress.md`).

## Orden de capas

```text
1. @afterdark/validators (sacar 'de' del enum)
2. apps/dashboard (mock → storage utils → form context → UI, sin cambios de estructura)
```

## Archivos creados / modificados

### Validators

| Archivo                               | Cambio                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/validators/src/settings.ts` | `SETTINGS_LANGUAGE` y `settingsLanguageSchema`: sacar `DE` / `'de'`. Solo `es`/`en`. |

### Client (dashboard)

| Archivo                                                            | Cambio                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/dashboard/app/modules/owner/constants/settings.mock.ts`      | `LANGUAGE_OPTIONS`: sacar entrada "Deutsch".                                                                                                                                                                                                                                                                       |
| `apps/dashboard/app/modules/owner/utils/settings-storage.utils.ts` | `createSettingsFormValues(user, currentLanguage)`: nuevo parámetro; `preferences.language` sale del idioma real, no del mock guardado en `localStorage`.                                                                                                                                                           |
| `apps/dashboard/app/modules/owner/hooks/settings-form-context.tsx` | Usa `useLanguage()` de `@afterdark/i18n/client`. Pasa `currentLanguage` a `createSettingsFormValues` en mount/owner-change. En `save()`: si `preferences.language` elegido difiere del real, llama `applyLanguage()` recién tras el `updateCurrentOwner` exitoso; arma `nextValues` con el idioma recién aplicado. |

## Diseño técnico

- El idioma sigue siendo preferencia 100% cliente (cookie `afterdark_lang` + `localStorage` de i18next) — no se persiste en `owners` vía API.
- `setLanguage()` real solo se dispara dentro de `save()`, después de que `updateCurrentOwner` resuelve OK — si falla, no hay cambio de idioma (regla de negocio en `spec.md`).
- El `useEffect` de reset-por-owner-change usa `currentLanguage` capturado en closure pero **no** lo incluye en el dependency array a propósito: si lo incluyera, se dispararía otra vez inmediatamente después de `applyLanguage()` dentro de `save()`, pisando el estado `SUCCESS` recién seteado. Comentario dejado en el código explicando esto (oxlint tira warning de `exhaustive-deps`, no error).

## Riesgos / edge cases

| Caso                                                        | Comportamiento esperado                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `updateCurrentOwner` falla                                  | Idioma real no cambia; queda en `ERROR` con mensaje de fallback, igual que otros campos.                 |
| Usuario elige idioma y hace "Descartar cambios" sin guardar | Select vuelve al idioma vigente (`savedValues`); `setLanguage()` real nunca se llamó.                    |
| Usuario guarda sin tocar el idioma                          | `nextLanguage === currentLanguage` → no se llama `applyLanguage()` (evita `changeLanguage` innecesario). |

## Verificación manual

| Paso                                                                                                                | Resultado esperado                                                          |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1. `pnpm --filter @afterdark/validators --filter dashboard type-check`                                              | Sin errores.                                                                |
| 2. `pnpm lint`                                                                                                      | Sin errores (1 warning esperado de `exhaustive-deps`, comentado en código). |
| 3. `pnpm --filter dashboard dev` → smoke request a `/settings`                                                      | Responde 200, sin trazas de error en el HTML.                               |
| 4. (Pendiente, requiere sesión de dueño) Login → Configuración → Preferencias → cambiar a English → Guardar cambios | UI cambia a inglés sin recargar; al recargar sigue en inglés.               |
| 5. (Pendiente) Elegir idioma, no guardar, clic en "Descartar cambios"                                               | Select vuelve al idioma anterior; UI nunca cambió de idioma.                |

Pasos 4 y 5 no se probaron en este turno (requieren login como dueño); quedan para QA manual del usuario.
