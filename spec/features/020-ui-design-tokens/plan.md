# Plan de implementación — Tokens de design system (UI)

> Cómo se implementa esta feature. Complementa `spec.md`; no repetir criterios de aceptación.

## Orden de capas

```text
1. packages/ui/src/globals.css  (token + utilidad)
2. packages/ui/src/components   (reemplazar rounded-xl → rounded-control)
```

## Archivos a crear / modificar

### UI package

| Archivo                                               | Cambio                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/ui/src/globals.css`                         | `--radius-control` en `@theme`; `.rounded-control` en `@layer utilities` |
| `packages/ui/src/components/ui/button.tsx`            | `rounded-xl` → `rounded-control`                                         |
| `packages/ui/src/components/ui/input.tsx`             | idem                                                                     |
| `packages/ui/src/components/ui/card.tsx`              | idem                                                                     |
| `packages/ui/src/components/ui/dialog.tsx`            | idem                                                                     |
| `packages/ui/src/components/ui/select.tsx`            | content con `rounded-xl` → `rounded-control`                             |
| `packages/ui/src/components/ui/sidebar.tsx`           | inset `rounded-xl` → `rounded-control`                                   |
| `packages/ui/src/components/ui/not-image.stories.tsx` | wrapper demo                                                             |

## Diseño técnico

1. En `@theme`: `--radius-control: var(--radius-xl)` (12px, mismo valor que Tailwind `rounded-xl` del tema).
2. En `@layer utilities`: `.rounded-control { border-radius: var(--radius-control); }`.
3. Para cambiar el radius global de controles: editar solo `--radius-control` en `globals.css`.
4. Patrón futuro: `--shadow-control` + `.shadow-control`, etc.

## Riesgos / edge cases

| Caso                              | Comportamiento esperado                                                     |
| --------------------------------- | --------------------------------------------------------------------------- |
| Clase custom vs utilidad Tailwind | `rounded-control` es utilidad propia; no choca con `rounded-xl` de Tailwind |
| `rounded-full`                    | Sin cambios                                                                 |
| Apps con `rounded-xl` local       | Siguen con valor fijo hasta follow-up                                       |

## Verificación manual

| Paso                                                | Resultado esperado                                        |
| --------------------------------------------------- | --------------------------------------------------------- |
| 1. Abrir Storybook o dashboard (button/input/card)  | Radius visual = 12px (igual que antes)                    |
| 2. Cambiar temporalmente `--radius-control` a `4px` | Controles migrados se ven más cuadrados; avatar/switch no |
| 3. Revertir a `var(--radius-xl)`                    | Vuelve a 12px                                             |
