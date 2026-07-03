# Tasks — Selector de idioma

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista fases 1–4 en `done`; fase 5 `in_progress` (edge case inferido, sin confirmación explícita del usuario — ver `progress.md`)
- [x] Usuario pidió implementar explícitamente antes de marcar `approved` formalmente (excepción del protocolo)
- [x] `plan.md` escrito (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `@afterdark/validators`: sacar `de` de `SETTINGS_LANGUAGE` / `settingsLanguageSchema`

## Client (dashboard)

- [x] `settings.mock.ts`: sacar "Deutsch" de `LANGUAGE_OPTIONS`
- [x] `settings-storage.utils.ts`: `createSettingsFormValues` toma idioma real como parámetro
- [x] `settings-form-context.tsx`: conecta `useLanguage()` / `setLanguage()` real en `save()`

## Calidad

- [x] `pnpm type-check` (validators + dashboard)
- [x] `pnpm lint`
- [x] Smoke check: dev server levanta, `/settings` responde 200 sin errores en HTML
- [ ] QA manual con sesión de dueño (pasos 4–5 de `plan.md` → `pnpm dev:dashboard`, login, Configuración → Preferencias)
- [ ] Criterios de aceptación de `spec.md` confirmados por el usuario en browser

## Cierre

- [ ] Status → `approved`/`done` en `spec.md` y `roadmap.md` (pendiente confirmación del usuario tras QA manual)
