# Progreso de entrevista — `i18n-integration`

> Spec retroactiva — feature ya implementada. Todas las fases marcadas `done`.

| Fase | Nombre | Estado |
| ---- | ------ | ------ |
| 1 | Identidad | `done` |
| 2 | Comportamiento y alcance | `done` |
| 3 | User stories | `done` |
| 4 | Contratos | `done` |
| 5 | Reglas y cierre | `done` |
| 6 | Plan técnico | `done` |

---

## Log de respuestas

### Fase 1 — Identidad

- **Feature:** infraestructura i18n compartida para el monorepo.
- **Apps:** `packages/i18n` consumido por `api`, `dashboard`, `web`.
- **Motor:** i18next 23 + react-i18next 15 + i18next-icu 2 + TS 6.
- **Dependencias:** ninguna feature anterior; es base de todas.

### Fase 2 — Comportamiento y alcance

- **Loader cliente:** Vite `import()` dinámico por namespace.
- **Loader servidor:** JSON estáticos, sin FS en prod.
- **Idiomas:** español e inglés; 5 namespaces; cookie `afterdark_lang`.
- **Fuera de alcance:** contenido de usuario, `Accept-Language`, namespaces por feature.

### Fase 3 — User stories

- Feature técnica / infraestructura — sin stories de usuario final.
- Audiencia: developers del monorepo usando `useTranslation`, `TranslationService`, `installZodI18n`.

### Fase 4 — Contratos

- Sub-path exports definidos y estables.
- Convención `namespace:clave` para mensajes Zod custom.
- Patrón `stripNs` y `resolveError` documentados.
- Patrón `{ useSuspense: false }` para SSR.
- Zod 4 bypass para `.min(n, 'custom')` workaroundeado a nivel componente.

### Fase 5 — Reglas y cierre

- Reglas de negocio: sin hardcode, ICU obligatorio para plurales, `useSuspense: false` en SSR, `check:i18n` en CI.
- Status spec → `done`.

### Fase 6 — Plan técnico

- Implementado: `packages/i18n/{client,server,config,constants,utils}`, locales, loaders, `zod-error-map.ts`, `TranslationService`, `LanguageMiddleware`.
- Bugs resueltos durante implementación: ICU braces faltantes en `too_small`/`too_big`, doble namespace en `t()`, Zod 4 bypass para mensajes custom.

---

## Supuestos del asistente

- La spec se creó retroactivamente a partir del código implementado.
