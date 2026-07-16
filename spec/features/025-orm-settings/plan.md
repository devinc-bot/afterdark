# Plan de implementación — Configuración del ORM (Drizzle)

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.

## Orden de capas

```text
1. packages/db/drizzle.config.ts
2. packages/db/DATABASE.md
3. AGENTS.md (una línea)
```

## Archivos a crear / modificar

### Database / config

| Archivo | Cambio |
| ------- | ------ |
| `packages/db/drizzle.config.ts` | Añadir `migrations: { prefix: 'timestamp' }` al objeto exportado |
| `packages/db/DATABASE.md` | En sección Migraciones: explicar que nuevas usan timestamp; históricas `0000`…`0020` se mantienen |
| `AGENTS.md` | En gotcha de Drizzle migrations: mencionar prefijo `timestamp` |

## Diseño técnico

Drizzle Kit (`0.31.x`) acepta `migrations.prefix` con valores `index` \| `timestamp` \| `supabase` \| `unix` \| `none`. Default actual = `index` (implícito). Con `timestamp`, `drizzle-kit generate` escribe archivos `YYYYMMDDHHmmss_<name>.sql` y entradas correspondientes en `meta/_journal.json` sin tocar migraciones previas.

No hace falta migración ni cambio de schema para activar el prefijo.

## Riesgos / edge cases

| Caso | Comportamiento esperado |
| ---- | ----------------------- |
| Dos generates el mismo segundo | Colisión de nombre; resolver en merge a mano |
| Journal / snapshots existentes | Sin cambio; solo entradas nuevas usan timestamp |
| CI / `db:migrate` | Sin cambio de comando; lee journal por orden |

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| 1. Revisar `drizzle.config.ts` | Contiene `migrations.prefix: 'timestamp'` |
| 2. Listar `src/migrations/*.sql` | Siguen existiendo `0000`…`0020` sin renombrar |
| 3. (Opcional) Cambio mínimo de schema + `pnpm --filter @afterdark/db db:generate` | Archivo nuevo con prefijo timestamp; luego descartar el cambio de prueba si no se quiere commitear |
