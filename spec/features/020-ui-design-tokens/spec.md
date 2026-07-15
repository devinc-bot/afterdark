# Tokens de design system (UI)

> Completar con la entrevista guiada — [INTERVIEW.md](../../INTERVIEW.md). Estado por fase en `progress.md`.

| Campo      | Valor                      |
| ---------- | -------------------------- |
| **ID**     | `020-ui-design-tokens`     |
| **Status** | `approved`                 |
| **Apps**   | `ui` · `web` · `dashboard` |

---

## Qué hace

Centraliza estilos de componentes en tokens/clases CSS en `@afterdark/ui`, de modo que un cambio en un solo lugar actualice todos los controles que lo usen. La primera entrega es el border-radius de controles/superficies principales.

## Por qué

Hoy el radius (y a futuro otros estilos) está hardcodeado por componente (`rounded-xl`, `rounded-lg`, …). Cambiar la apariencia global obliga a editar muchos archivos. Un sistema de tokens evita ese trabajo y mantiene coherencia visual entre `web` y `dashboard`.

## Alcance

### Incluye

- Convención de tokens/clases CSS extensible en `packages/ui` (design system).
- **1ª entrega — border-radius:**
  - Clase `rounded-control` con valor por defecto equivalente a `rounded-xl` (12px / `--radius-xl`).
  - Migrar en `@afterdark/ui` los usos de `rounded-xl` en componentes de producto (button, input, card, dialog, select content, etc.) a `rounded-control`.
- Consumo automático en `web` / `dashboard` vía `globals.css` compartido.

### No incluye

- Otros tokens en esta entrega (sombra, borde, tipografía, spacing de control, etc.) — quedan para ampliaciones futuras de la misma feature/patrón.
- Unificar ahora `rounded-lg` / `rounded-md` / `rounded-sm` (salvo que ya fueran `rounded-xl`).
- Forzar el mismo radius en formas intrínsecamente circulares/pill (`rounded-full`: avatar, switch, dots).
- API, base de datos, copy de UI, rediseño visual más allá del token.

---

## User stories

### US-1: Cambiar radius global

**Como** desarrollador (design system / frontend)  
**Quiero** ajustar un solo token/clase de border-radius  
**Para** que button, input, card, dialog y demás controles cambien de radius juntos

**Criterios de aceptación**

- [ ] **Dado** componentes de `@afterdark/ui` que usan `rounded-control`, **cuando** cambio el valor del token en `globals.css`, **entonces** todos esos componentes reflejan el nuevo radius.
- [ ] **Dado** el valor por defecto del token, **cuando** no lo modifico, **entonces** el radius se ve igual que `rounded-xl` (12px / `--radius-xl`).
- [ ] **Dado** componentes con forma circular/pill (`rounded-full`: avatar, switch, dots), **cuando** cambio `rounded-control`, **entonces** esos componentes no cambian.

### US-2: Extender el patrón a otros estilos

**Como** desarrollador  
**Quiero** una convención documentada de tokens/clases  
**Para** agregar en el futuro otros estilos (sombra, borde, tipografía…) sin inventar otro mecanismo

**Criterios de aceptación**

- [ ] **Dado** la spec/plan de esta feature, **cuando** se agregue un token nuevo, **entonces** sigue el mismo patrón: variable CSS + clase/utilidad + uso en componentes (sin hardcodear el valor en cada uno).
- [ ] **Dado** la 1ª entrega, **cuando** reviso el código, **entonces** solo el border-radius de control está migrado; el resto de tokens quedan fuera de alcance pero el patrón es reutilizable.

---

## Contratos

### API (si aplica)

N/A — cambio de design system / CSS.

### Datos (si aplica)

N/A

### UI (si aplica)

| Pieza                       | Contrato                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Variable CSS                | `--radius-control: var(--radius-xl)` en `@theme` (default 12px)                                     |
| Clase                       | `.rounded-control { border-radius: var(--radius-control); }` en `@layer utilities`                  |
| Componentes `@afterdark/ui` | Reemplazar `rounded-xl` de controles/superficies por `rounded-control`                              |
| Apps `web` / `dashboard`    | No migrar `rounded-xl` locales en esta entrega (heredan el CSS; migración de apps = follow-up)      |
| Stories                     | Actualizar wrappers/demos en `@afterdark/ui` que hardcodean `rounded-xl` en el mismo alcance        |
| Futuros tokens              | Prefijo `*-control` (ej. `shadow-control`, `border-control`): variable + clase + uso en componentes |

**Componentes a migrar (1ª entrega, lista orientativa)**

`button`, `input`, `card`, `dialog`, `select` (content con `rounded-xl`), `sidebar` (inset con `rounded-xl`), y cualquier otro archivo de `packages/ui` con `rounded-xl` de producto (no stories de layout ajenas al token).

**Copy (español)**

N/A

---

## Reglas de negocio

1. El radius de control de producto se define solo vía `--radius-control` / `rounded-control`; no reintroducir `rounded-xl` en componentes de producto de `@afterdark/ui`.
2. Excepciones permitidas: `rounded-full` (y pills) donde la forma lo exige; radii menores (`sm`/`md`/`lg`) en piezas internas hasta una entrega futura.
3. Tokens nuevos siguen el patrón: variable CSS + clase `*-control` + uso en componentes (sin hardcodear el valor en cada archivo).
4. Cambiar `--radius-control` no debe romper overflow/clip de cards, dialogs ni selects — verificar visualmente.

## Preguntas abiertas

- Migración de `rounded-xl` en apps `web`/`dashboard` (fuera de `@afterdark/ui`): follow-up opcional, no bloquea esta entrega.
