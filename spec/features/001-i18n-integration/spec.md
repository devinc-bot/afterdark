# Integración i18n — paquete compartido y Zod

| Campo | Valor |
| ----- | ----- |
| **ID** | `001-i18n-integration` |
| **Status** | `done` |
| **Apps** | `packages/i18n` · `api` · `dashboard` · `web` |

---

## Qué hace

`@afterdark/i18n` provee la infraestructura de traducciones compartida para el monorepo: entrega strings localizados a las apps React (`dashboard`, `web`) en cliente y SSR, y al servidor NestJS (`api`) resolviendo el idioma por pedido. Se integra con Zod 4 para que los errores de validación de schemas aparezcan en el idioma activo sin componer mensajes a mano en cada campo.

## Por qué

Sin una capa i18n centralizada cada app mantendría su propia lógica de traducción, generando drift de copy entre idiomas y duplicación de configuración. La API también debe responder en el idioma del usuario para mensajes de error sin filtrar el locale del servidor.

## Alcance

### Incluye

- `packages/i18n` con 5 namespaces (`common`, `auth`, `validation`, `errors`, `emails`) en español e inglés.
- Loader cliente: Vite `import()` dinámico por namespace — sin bundle estático, code-split friendly.
- Loader servidor: imports JSON estáticos, sin lectura de FS en producción.
- Integración con Zod 4: `installZodI18n` (error map global) y `createZodErrorMap` (por instancia).
- ICU MessageFormat (via `i18next-icu`) para plurales en mensajes de validación.
- Soporte SSR: patrón `{ useSuspense: false }` para hooks que corren en servidor.
- Servicio NestJS `TranslationService` con `AsyncLocalStorage` para contexto de idioma por request.
- Script `check:i18n` que valida paridad de claves y consistencia de placeholders entre idiomas.

### No incluye

- Traducción de contenido generado por el usuario.
- Detección de idioma por `Accept-Language` header (se usa cookie `afterdark_lang`).
- Carga de namespaces adicionales por feature (los 5 namespaces cubren todo el alcance actual).
- Plurales en inglés más allá de `one`/`other`.

---

## Contratos

### Package — sub-path exports

| Sub-path | Contenido |
| -------- | --------- |
| `@afterdark/i18n` | config, constantes, tipos, utils (zod, language-detector) |
| `@afterdark/i18n/client` | `I18nProvider`, `initI18n`, `useTranslation` re-export, `setLanguage` |
| `@afterdark/i18n/server` | `TranslationService`, `LanguageMiddleware`, `@Language()`, `I18nModule` |
| `@afterdark/i18n/config` | `LANGUAGE`, `NAMESPACE`, `BASE_I18N_OPTIONS` |
| `@afterdark/i18n/constants` | `AUTH_ERROR_CODE`, `INVITATION_ERROR_CODE`, `CLUB_ERROR_CODE`, `VALIDATION_KEY`, `COMMON_KEY` |
| `@afterdark/i18n/utils/zod` | `installZodI18n`, `createZodErrorMap` |

### Convención de claves en validators

Los mensajes custom en schemas Zod usan el formato `namespace:clave.sub`:

```ts
// .min() con mensaje custom
.min(8, 'validation:field.phone.invalid')

// superRefine
ctx.addIssue({ code: 'custom', message: 'validation:field.address.allOrNone' })
```

El error map detecta `:` en el mensaje y llama `t(clave)` en el namespace correspondiente. Los validators estándar (`min`, `max`, `email`) sin mensaje custom son manejados por el error map con claves fijas en `validation.json`.

### Namespaces y locales

| Namespace | Claves aprox. | Uso |
| --------- | ------------- | --- |
| `common` | 40 | Labels globales, acciones, estados |
| `auth` | 35 | Flujo login/registro, errores de auth |
| `validation` | 41 | Mensajes Zod, errores de campos |
| `errors` | 42 | Errores HTTP, mensajes de API |
| `emails` | 21 | Plantillas de email transaccional |

Cada namespace tiene `es.json` y `en.json`. El script `check:i18n` verifica paridad.

### Integración Zod 4 — error map

```ts
// Instalar globalmente (en root de cada app)
import { installZodI18n } from '@afterdark/i18n/utils/zod'
installZodI18n(t)  // t = useTranslation('validation').t

// O por instancia de schema
import { createZodErrorMap } from '@afterdark/i18n/utils/zod'
schema.parse(data, { errorMap: createZodErrorMap(t) })
```

**Códigos Zod 4 (diferencias clave respecto a Zod 3):**

| Zod 3 | Zod 4 | Clave en `validation.json` |
| ----- | ----- | -------------------------- |
| `invalid_string` | `invalid_format` | `zod.invalid_string.{format}` |
| `invalid_enum_value` | `invalid_value` | `zod.invalid_enum_value` |

**Plurales ICU** para `too_small` y `too_big` (requieren `i18next-icu`):

```json
"too_small": {
  "string": "{minimum, plural, one {Mínimo # carácter.} other {Mínimo # caracteres.}}"
}
```

### Patrón `stripNs` — namespace doble

`t` enlazado al namespace `validation` no puede resolver `'validation:clave'` (doble prefijo). El error map aplica `stripNs` internamente:

```ts
const stripNs = (key: string): string =>
  key.includes(':') ? key.split(':').slice(1).join(':') : key
```

Los validators no necesitan preocuparse por esto — el error map lo maneja automáticamente.

### Bypass de Zod 4 para mensajes custom en `min`/`max`

Cuando `.min(n, 'custom')` provee un mensaje custom, **Zod 4 saltea el error map global** y retorna el string crudo. Workaround en el componente:

```tsx
const { t: tValidation } = useTranslation('validation', { useSuspense: false })

const resolveError = (errors: ReadonlyArray<unknown>): string | null => {
  const raw = fieldErrorMessage(errors)
  if (!raw) return null
  if (raw.includes(':')) return tValidation(raw.split(':').slice(1).join(':') as never)
  return raw
}
```

### Patrón SSR — `useSuspense: false`

La configuración global de i18next usa `useSuspense: true`. Todo hook `useTranslation` que ejecute durante SSR (ruta pública, `usePageTitle`, hooks de componentes sin loader server-side) **debe** pasar `{ useSuspense: false }` para evitar que suspenda el stream:

```ts
const { t } = useTranslation('staff', { useSuspense: false })
```

### Wiring por app

| App | Cómo |
| --- | ---- |
| `dashboard` / `web` | `I18nProvider` envuelve `QueryClientProvider` en `__root.tsx` |
| `api` | `I18nModule` primero en el array `AppModule.imports`; `LanguageMiddleware` en `configure()` |

### Configuración pnpm

```json
// package.json raíz — peerDependencyRules
"react-i18next>typescript": "6"
```

Necesario porque react-i18next 15.x declara peer TS ^5; el monorepo usa TS 6.

---

## Reglas de negocio

- **Todo mensaje de validación es una clave i18n.** Prohibido hardcodear strings en español en schemas Zod.
- **Plurales con ICU.** `too_small` y `too_big` usan `{var, plural, one {...} other {...}}` con llaves externas balanceadas. Un `}` faltante hace que i18next-icu devuelva el string crudo en lugar de parsear.
- **`useSuspense: false` obligatorio en SSR.** Cualquier `useTranslation` que corra en el servidor — incluidos hooks de utilidad como `usePageTitle` — necesita la opción o rompe el stream SSR.
- **`check:i18n` debe pasar en CI.** Ninguna clave puede existir en un idioma y faltar en el otro.
- **Bypass de Zod 4:** el workaround `resolveError` en componente solo es necesario para constraints con mensaje custom explícito (`.min(n, 'key')`). Constraints sin mensaje custom siguen usando el error map global.

## Preguntas abiertas

- ¿Agregar namespace `staff` a `check:i18n` (actualmente solo valida los 5 originales)?
- ¿Definir convención para namespaces de features (ej. `staff`, `clubs`) vs namespaces base?
