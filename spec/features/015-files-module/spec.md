# Módulo de archivos (infraestructura)

> Entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor              |
| ---------- | ------------------ |
| **ID**     | `015-files-module` |
| **Status** | `draft`            |
| **Apps**   | `api`              |

---

## Qué hace

<!-- Fase 2: comportamiento observable. Hoy: servicio interno de subida/eliminación de imágenes en R2. -->

Servicio de infraestructura en `apps/api` para subir y eliminar imágenes en Cloudflare R2. Consumido por otros módulos (p. ej. `clubs`); sin endpoints HTTP propios ni UI.

## Por qué

<!-- Fase 2 -->

Centralizar almacenamiento de medios (R2, validación MIME, límites de tamaño, claves UUID) para que features de dominio (`club-assets`, avatares, etc.) no dupliquen lógica de storage.

## Alcance

### Incluye

- `FilesService` (`uploadImage`, `deleteImages`, `buildImageKey`)
- Adaptador R2 vía `files-sdk`
- Validación de tipo MIME y tamaño (`@repo/validators`, `ENV.UPLOAD_MAX_BYTES`)
- Mensajes de error vía `@repo/i18n` (`FILE_ERROR_CODE`)
- Opciones Multer compartidas (`imageUploadOptions`)

### No incluye

- Tablas `assets` / `club_assets_lnk` ni galería de clubes → ver `005-club-assets`
- Endpoints HTTP dedicados (`POST /files`, etc.) salvo que se acuerde en fase 4
- UI en `dashboard` o `web`
- Tipos de archivo distintos de imagen (JPG, PNG, WEBP) salvo que se amplíe en esta spec

---

## User stories

<!-- Fase 3 -->

## Contratos

<!-- Fase 4 -->

### API (estado actual)

Sin controller propio. Uso interno desde otros servicios (p. ej. `ClubsService`).

**Errores existentes (i18n `file.*`)**

| Código                    | Mensaje (es)                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `file.INVALID_IMAGE_TYPE` | El archivo debe ser una imagen JPG, PNG o WEBP.                  |
| `file.FILE_TOO_LARGE`     | La imagen supera el tamaño máximo permitido.                     |
| `file.UPLOAD_FAILED`      | No pudimos guardar la imagen. Intentá de nuevo en unos minutos.  |
| `file.DELETE_FAILED`      | No pudimos eliminar la imagen. Intentá de nuevo en unos minutos. |

### Datos

Sin tablas propias del módulo `files`. Metadatos de assets quedan en features de dominio.

### UI

No aplica (`api` only).

---

## Reglas de negocio

<!-- Fase 5 -->

- Solo imágenes permitidas: JPG, PNG, WEBP (`isAllowedImageMimeType`).
- Clave de objeto: `{uuid}{ext}` bajo `ENV.R2_UPLOAD_PREFIX`.
- `cacheControl`: `public, max-age=31536000, immutable` en upload.

## Preguntas abiertas

- ¿Qué modificación concreta se va a hacer en esta feature? (pendiente del usuario)
