---
name: spec-interview
description: >-
  Crear o actualizar los tres artefactos SDD de una feature en spec/features/.
  Usar cuando el usuario pida crear, empezar, completar o retomar una feature
  SDD, o escribir spec.md/plan.md/tasks.md desde cero.
---

# Spec interview (repo)

## Antes de escribir

1. Leer [spec/INTERVIEW.md](../../../spec/INTERVIEW.md), [spec/README.md](../../../spec/README.md) y
   [spec/SPEC_TEMPLATE.md](../../../spec/SPEC_TEMPLATE.md).
2. Leer `spec/constitution/mission.md`, `roadmap.md` y `tech-stack.md`.
3. Si la feature ya existe: leer sus tres artefactos en `spec/features/active/<NNN-slug>/`.
4. Delegar la exploración del código relevante a un subagente antes de redactar. El subagente debe informar al hilo principal la arquitectura, patrones, archivos afectados, dependencias y riesgos.

## Comportamiento obligatorio

- Preguntar solo lo necesario para resolver intención, alcance, non-goals, usuarios y escenarios.
- Usar **AskQuestion** para opciones finitas (apps, roadmap, approved/draft).
- Pre-rellenar desde código/roadmap y **confirmar** con el usuario.
- **No implementar código** durante la entrevista salvo pedido explícito.

## Archivos a mantener

| Archivo | Rol |
| ------- | --- |
| `spec.md` | Product requirements using `spec/SPEC_TEMPLATE.md` in English |
| `plan.md` | Technical approach and verification strategy |
| `tasks.md` | Ordered implementation checklist |

Crear `spec/features/active/<NNN-slug>/` con exactamente esos tres archivos.

Every new `spec.md` must use `spec/SPEC_TEMPLATE.md` exactly. Write its headings, user stories, EARS
functional requirements, and all technical content in English. Keep an unanswered product decision in the
`Open Questions` section with the `[NEEDS CLARIFICATION]` marker.

## Formato de respuesta al usuario

Resumir las decisiones, indicar los artefactos actualizados y señalar la siguiente acción.

## Retomar

Leer los tres artefactos, resumir lo acordado y continuar desde la primera decisión o tarea pendiente.
