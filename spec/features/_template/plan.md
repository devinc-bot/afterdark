# Plan de implementación — [Título]

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.

## Orden de capas

```text
1. @afterdark/validators
2. @afterdark/types
3. packages/db (schema → migration → repository)
4. apps/api (module → service → controller)
5. apps/web | apps/dashboard (service → query/mutation → UI → route)
```

## Archivos a crear / modificar

### Validators

| Archivo | Cambio |
| ------- | ------ |
| `packages/validators/src/<m>.ts` | |

### Types

| Archivo | Cambio |
| ------- | ------ |
| `packages/types/src/api.ts` | |

### Database

| Archivo | Cambio |
| ------- | ------ |
| `packages/db/src/schema/` | |
| `packages/db/src/repositories/` | |

### API

| Archivo | Cambio |
| ------- | ------ |
| `apps/api/src/modules/<name>/` | |

### Client

| App | Archivo | Cambio |
| --- | ------- | ------ |
| `dashboard` | `app/modules/<m>/` | |
| `web` | `app/modules/<m>/` | |

## Diseño técnico

<!-- Decisiones: por qué este módulo, qué inyecta, flujo de datos. -->

## Riesgos / edge cases

| Caso | Comportamiento esperado |
| ---- | ----------------------- |
| | |

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| 1. | |
| 2. | |
