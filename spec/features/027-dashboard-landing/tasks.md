# Tasks — Landing del dashboard

> Checklist de tareas. Marcar `[x]` al completar.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## i18n

- [x] `locales/dashboard-landing/es.json` + `en.json`
- [x] Registrar namespace en `namespaces.ts` (`DASHBOARD_LANDING` + `ALL_NAMESPACES`)
- [x] Registrar en `client-loader.ts`
- [x] Registrar en `server-loader.ts` (imports + `SERVER_RESOURCES`)
- [x] Registrar tipo en `types/index.ts` (`I18nResources`)

## dashboard

- [x] Módulo `landing/` (componentes por sección + `landing-page.tsx`)
- [x] Constantes de contenido (`constants/landing-content.ts`)
- [x] Ruta pública `routes/index.tsx` (`RequireGuest` + `LandingPage`)
- [x] Eliminar `routes/_app/index.tsx`

## Calidad

- [x] `pnpm type-check`
- [x] `pnpm lint`
- [x] `check:i18n` (paridad ES/EN)
- [ ] Verificación manual en browser según `plan.md`
- [ ] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [ ] Status → `done` en `spec.md` y `roadmap.md` (tras QA manual)
