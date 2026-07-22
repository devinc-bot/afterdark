# Landing del dashboard

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                 |
| ---------- | --------------------- |
| **ID**     | `027-dashboard-landing` |
| **Status** | `approved`            |
| **Apps**   | `dashboard`           |

**Depende de:** `001-auth-sessions` (CTAs de login/registro y estado de sesión). Toma `023-web-landing` como referencia de estilo/estructura.

---

## Qué hace

La ruta pública `/` del dashboard muestra una landing de marketing orientada a **dueños de clubes**: explica qué resuelve la plataforma e invita a crear cuenta o iniciar sesión. Un dueño ya autenticado que entra a `/` es redirigido automáticamente a `/dashboard` (el panel). La landing es, por lo tanto, exclusiva para visitantes sin sesión.

## Por qué

Hoy `/` del dashboard está detrás del guard `_app` y redirige directo a `/dashboard`, así que un dueño que aún no tiene cuenta no encuentra una puerta de entrada que le explique el producto. Esta landing da contexto de negocio y un camino claro a registro/login. Refuerza el principio de misión "dueño primero en el dashboard". Depende de `001-auth-sessions` para los CTAs y el estado de sesión.

## Alcance

### Incluye

- Nueva ruta pública `routes/index.tsx` en `/` (fuera del guard `_app`).
- Redirección de dueño autenticado en `/` → `/dashboard`.
- Secciones de la landing:
  - **Hero** con titular + CTAs (crear cuenta / iniciar sesión).
  - **Beneficios/features** para dueños (gestionar eventos, entradas, staff, ventas).
  - **Cómo funciona** (pasos: crear club → publicar evento → vender entradas).
  - **Prueba social** (frases de valor / testimonios cualitativos, sin números).
  - **FAQ** (preguntas frecuentes).
  - **Cierre** con CTA final.
  - **Footer** (links, legal, contacto).
- Diseño propio sobrio con componentes de `@afterdark/ui` (sin video ni animaciones pesadas tipo hero de `web`).
- Copy i18n **ES + EN** vía `@afterdark/i18n`.
- Reutilizar sesión existente del dashboard (`useSessionStore` / `GET /session/me`) para decidir guest vs redirect.

### No incluye

- Datos reales: todo el contenido es estático/marketing (métricas y testimonios hardcodeados).
- Video pesado o animaciones scroll-scrub como en la landing de `web`.
- Blog, planes/precios reales o página de pricing.
- Rutas nuevas más allá de `/` (los CTAs apuntan a `/register` y `/login` existentes).
- Cambios en el panel autenticado (`/dashboard` y demás pantallas `_app`).

## User stories

Roles: **visitante sin sesión** (dueño potencial) y **dueño autenticado** (`owner`).

### US-1: Conocer el producto

**Como** visitante sin sesión  
**Quiero** ver una landing que explique cómo la plataforma me ayuda a gestionar mi club  
**Para** evaluar si me conviene crear una cuenta

**Criterios de aceptación**

- [ ] **Dado** que no hay sesión **Cuando** entro a `/` **Entonces** veo el hero, beneficios, cómo funciona, métricas, FAQ, cierre y footer
- [ ] **Dado** que estoy en la landing **Cuando** leo la sección de beneficios **Entonces** veo capacidades del panel (eventos, entradas, staff, ventas) en copy orientado al dueño
- [ ] **Dado** el idioma activo del dashboard **Cuando** veo la landing **Entonces** el copy aparece en ES o EN según `@afterdark/i18n`

### US-2: Registrarme / iniciar sesión

**Como** visitante sin sesión  
**Quiero** CTAs claros para crear cuenta e iniciar sesión  
**Para** empezar a usar el panel

**Criterios de aceptación**

- [ ] **Dado** que estoy en el hero **Cuando** hago clic en "Crear cuenta" **Entonces** navego a `/register`
- [ ] **Dado** que estoy en el hero o el cierre **Cuando** hago clic en "Iniciar sesión" **Entonces** navego a `/login`
- [ ] **Dado** que veo la sección de cierre **Cuando** la reviso **Entonces** hay un CTA final a crear cuenta

### US-3: Atajo al panel

**Como** dueño autenticado  
**Quiero** que al entrar a `/` me lleve directo a `/dashboard`  
**Para** no ver marketing que ya no necesito

**Criterios de aceptación**

- [ ] **Dado** sesión autenticada **Cuando** entro a `/` **Entonces** soy redirigido a `/dashboard` sin ver la landing
- [ ] **Dado** que no hay sesión **Cuando** entro a `/` **Entonces** veo la landing (no redirige)

---

## Contratos

### API (si aplica)

Sin endpoints nuevos. Reutiliza sesión existente (`useSessionStore` / `GET /session/me`) solo para decidir guest vs redirect.

### Datos (si aplica)

Sin cambios de esquema.

### UI

| Ruta | Pantalla                                                                 |
| ---- | ------------------------------------------------------------------------ |
| `/`  | Landing pública del dashboard (redirige a `/dashboard` si hay sesión owner) |

**Estructura de secciones**

| # | Sección        | Contenido                                                                             |
| - | -------------- | ------------------------------------------------------------------------------------- |
| 1 | Header         | Logo/marca + link "Iniciar sesión" + botón "Crear cuenta"                             |
| 2 | Hero           | Titular, subtítulo, CTAs "Crear cuenta" (`/register`) e "Iniciar sesión" (`/login`)   |
| 3 | Beneficios     | ~4 tarjetas: eventos, entradas, staff, ventas                                         |
| 4 | Cómo funciona  | 3 pasos: crear club → publicar evento → vender entradas                               |
| 5 | Prueba social  | Frases de valor / testimonios **cualitativos** (sin números)                          |
| 6 | FAQ            | ~4 preguntas frecuentes                                                               |
| 7 | Cierre         | CTA final a "Crear cuenta"                                                            |
| 8 | Footer         | Marca + links placeholder (legal, contacto, redes)                                    |

**Copy (ES / EN)** — namespace i18n propuesto `dashboardLanding` en `@afterdark/i18n`. Texto final se redacta en implementación; ejemplos:

| Contexto        | ES                                              | EN                                              |
| --------------- | ----------------------------------------------- | ----------------------------------------------- |
| Hero — titular  | Gestioná tu club sin perder el ritmo            | Run your club without missing a beat            |
| Hero — CTA 1    | Crear cuenta                                     | Create account                                  |
| Hero — CTA 2    | Iniciar sesión                                   | Log in                                          |
| Beneficios — título | Todo tu negocio nocturno en un panel         | Your whole nightlife business in one panel      |
| Cómo funciona — título | Empezá en tres pasos                      | Get started in three steps                      |
| Cierre — CTA    | Crear cuenta                                     | Create account                                  |

---

## Reglas de negocio

- La landing en `/` es **pública**: se define fuera del guard `_app`.
- Cualquier **sesión válida** (owner o staff) que entre a `/` es redirigida a `/dashboard`; la landing solo la ve el visitante sin sesión.
- **Loading de sesión:** si hay token en cookie, no mostrar la landing hasta resolver la sesión (evitar flash antes de redirigir); si no hay token, mostrar landing directamente.
- **Error de red al resolver sesión:** tratar como visitante (mostrar landing); no bloquear la página.
- CTAs de la landing apuntan solo a rutas existentes: `/register` y `/login`. No se crean rutas nuevas.
- Todo el copy visible pasa por `@afterdark/i18n` (ES+EN); no hardcodear texto.
- No se modifican pantallas del panel autenticado (`/dashboard` y demás `_app`).
- El home autenticado sigue en `/dashboard`; `_app/index.tsx` puede eliminarse si `/` deja de vivir bajo `_app` (a confirmar en plan técnico).

## Preguntas abiertas

- Confirmar textos finales de titulares, beneficios, pasos, prueba social y FAQ (hoy redactados por el asistente).
- Contenido real del footer (legal, contacto, redes) — hoy placeholders.
- ¿Se desean micro-animaciones de reveal al hacer scroll (respetando `prefers-reduced-motion`) o estático total?
