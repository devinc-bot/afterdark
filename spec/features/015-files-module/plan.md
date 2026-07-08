# Plan de implementación — Módulo de archivos

> Borrador en **fase 6** de la entrevista. No implementar hasta `spec.md` en `approved`.

## Orden de capas

```text
1. @afterdark/validators (si cambian reglas MIME/tamaño)
2. @afterdark/i18n (si hay mensajes nuevos)
3. apps/api/src/modules/files/
4. Consumidores (p. ej. clubs) — solo si el contrato público de FilesService cambia
```

## Archivos a crear / modificar

### API

| Archivo | Cambio |
| ------- | ------ |
| `apps/api/src/modules/files/files.service.ts` | TBD según modificación |
| `apps/api/src/modules/files/image-upload.options.ts` | TBD |
| `apps/api/src/modules/files/files.module.ts` | TBD |

### Client

No aplica (`api` only).

## Diseño técnico

TBD en fase 6 tras acordar el cambio con el usuario.

## Riesgos / edge cases

| Caso | Comportamiento esperado |
| ---- | ----------------------- |
| TBD  |                         |

## Verificación manual

| Paso | Resultado esperado |
| ---- | ------------------ |
| TBD  |                    |
