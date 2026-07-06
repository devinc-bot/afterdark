# Selector de idioma

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                   |
| ---------- | ----------------------- |
| **ID**     | `011-language-switcher` |
| **Status** | `draft`                 |
| **Apps**   | `dashboard`             |

---

## Qué hace

Desde Configuración → Preferencias, el usuario cambia el idioma del panel (español/inglés). El cambio se aplica de inmediato a toda la UI del dashboard y se recuerda en la próxima visita.

## Por qué

`@afterdark/i18n` ya soporta `es`/`en` (namespaces, cookie `afterdark_lang`, SSR), pero no tiene punto de entrada funcional: el select "Idioma del panel" en Preferencias existe hoy solo como mock local (`settings.mock.ts`), sin conectar a `setLanguage()` real. Cumple el principio de misión "UI en español, código en inglés" dándole al usuario control real del idioma.

## Alcance

### Incluye

- Conectar el select "Idioma del panel" (`preferences-settings-section.tsx`) a `setLanguage()` de `@afterdark/i18n/client`.
- Valor inicial del select = idioma real actual (`useLanguage().language`), no el mock de `localStorage` de settings.
- Cambio de idioma inmediato (sin recargar página) vía `i18next.changeLanguage`.
- Persistencia en cookie `afterdark_lang` (ya la escribe `setLanguage()`) para que el `LanguageMiddleware` sirva el idioma correcto en el próximo request SSR.

### No incluye

- Selector de idioma en `apps/web` (no tiene header/nav todavía; queda para una feature futura).
- Idiomas nuevos más allá de `es`/`en` (`SUPPORTED_LANGUAGES` actual).
- Traducción de contenido generado por usuarios (nombres de clubes, descripciones, etc.).
- Cambios al resto de "Preferencias" (notificaciones) — sigue como mock local, sin tocar.

---

## User stories

### US-1: Cambiar idioma del panel

**Como** usuario del dashboard (dueño o staff)  
**Quiero** cambiar el idioma del panel desde Preferencias  
**Para** usar la UI en el idioma que prefiero

**Criterios de aceptación**

- [ ] **Dado** que estoy en Configuración → Preferencias, **Cuando** elijo "English" en el select de idioma y hago clic en "Guardar cambios", **Entonces** toda la UI visible cambia a inglés sin recargar la página.
- [ ] **Dado** que ya elegí un idioma antes y guardé, **Cuando** vuelvo a entrar al dashboard (nueva sesión o reload), **Entonces** se mantiene ese idioma.
- [ ] **Dado** que elegí un idioma nuevo en el select pero **todavía no** apreté "Guardar cambios", **Cuando** hago clic en "Descartar cambios", **Entonces** el select vuelve al idioma vigente y la UI no cambió de idioma en ningún momento.

---

## Contratos

### API

No aplica — cambio 100% cliente. `setLanguage()` de `@afterdark/i18n/client` ya persiste en `localStorage` + cookie `afterdark_lang`; no hay endpoint de preferencias de idioma en `api`.

### Datos

No aplica — sin tablas/columnas nuevas. El idioma no se guarda en `owners` vía `updateCurrentOwner`; sigue siendo preferencia de cliente (cookie), igual que hoy documenta `preferences.localHint`.

### UI

| Ruta        | Pantalla                                         |
| ----------- | ------------------------------------------------ |
| `/settings` | Configuración → sección Preferencias (ya existe) |

**Cambios de implementación (no nueva UI, conecta lo existente):**

| Archivo                                                          | Cambio                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/dashboard/.../constants/settings.mock.ts`                  | `LANGUAGE_OPTIONS`: sacar entrada `de` (Deutsch); dejar solo `es`/`en`.                                                                                                                                                                      |
| `apps/dashboard/.../hooks/settings-form-context.tsx`             | Dentro de `save()`, tras `updateCurrentOwner`/`saveStoredSettings` exitosos: si `validation.data.preferences.language` cambió respecto al idioma real actual (`useLanguage().language`), llamar `setLanguage()` de `@afterdark/i18n/client`. |
| `apps/dashboard/.../utils/settings-storage.utils.ts`             | `createSettingsFormValues`: valor inicial de `preferences.language` = idioma real actual (`getCurrentLanguage()`), no el guardado en `localStorage` de settings.                                                                             |
| `apps/dashboard/.../components/preferences-settings-section.tsx` | Sin cambios de estructura; sigue leyendo `LANGUAGE_OPTIONS` (ahora sin `de`).                                                                                                                                                                |

**Copy (español)** — sin copy nueva; se reusa `SETTINGS_COPY.preferences.language` / `.languagePlaceholder` ya existentes.

---

## Reglas de negocio

- El idioma real (`setLanguage()`) solo cambia si `save()` completa con éxito. Si `updateCurrentOwner` falla, el idioma se queda en el que estaba antes (mismo criterio que el resto de campos del form: sin éxito, no hay side-effect).
- Solo se llama `setLanguage()` si el idioma elegido difiere del idioma real actual (evita `i18next.changeLanguage` innecesario cuando el usuario guarda otros campos sin tocar el idioma).
- `SUPPORTED_LANGUAGES` (`es`/`en`) es la única fuente de verdad para las opciones del select; no hardcodear la lista en `dashboard`.

## Preguntas abiertas

- **Pendiente de confirmación del usuario:** regla de "save falla → no cambia idioma" (asumida por ser consistente con el resto del form; el usuario no respondió la pregunta de fase 5, se infirió).
- **Status:** queda en `draft` hasta que el usuario confirme explícitamente el pase a `approved`.
