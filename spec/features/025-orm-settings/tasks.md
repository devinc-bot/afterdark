# Tasks — Configuración del ORM (Drizzle)

> Checklist de tareas. Marcar `[x]` al completar. Orden sugerido de arriba a abajo.

## Spec & plan

- [x] Entrevista completa (`progress.md` fases 1–5 en `done`)
- [x] `spec.md` completo y en status `approved`
- [x] `plan.md` revisado (fase 6)
- [x] Entrada en `spec/constitution/roadmap.md`

## Shared packages

- [x] `drizzle.config.ts`: `migrations: { prefix: 'timestamp' }`
- [x] Documentar convenio en `DATABASE.md`
- [x] Una línea en `AGENTS.md` sobre prefijo timestamp

## Calidad

- [x] Confirmar que migraciones `0000`…`0020` siguen intactas
- [ ] (Opcional) `db:generate` de prueba produce archivo con timestamp; descartar artefacto si no aplica
- [x] Criterios de aceptación de `spec.md` cumplidos

## Cierre

- [x] Status → `done` en `spec.md` y `roadmap.md`
