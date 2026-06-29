---
name: spec-interview
description: >-
  Entrevista guiada para crear o ampliar specs de features en spec/features/.
  Usar cuando el usuario pida un cambio nuevo, feature, endpoint, pantalla o
  regla de negocio no cubierta por la spec actual — o crear/retomar spec SDD.
  Regla persistente: .claude/rules/spec-interview-before-changes.md
---

# Spec interview (afterdark)

## Antes de escribir

1. Leer [spec/INTERVIEW.md](../../../spec/INTERVIEW.md) — protocolo completo.
2. Leer `spec/constitution/mission.md`, `roadmap.md` y `tech-stack.md`.
3. Si la feature ya existe: leer `spec/features/00N-<slug>/progress.md` y continuar la fase pendiente.

## Comportamiento obligatorio

- **Preguntar por fases**; no volcar una spec completa sin respuestas del usuario.
- **Un turno = una fase** (máx. ~5 preguntas). Tras cada respuesta: actualizar archivos y resumir.
- Usar **AskUserQuestion** para opciones finitas (apps, roadmap, approved/draft).
- Pre-rellenar desde código/roadmap y **confirmar** con el usuario.
- **No implementar código** durante la entrevista salvo pedido explícito.

## Archivos a mantener

| Archivo | Rol |
| ------- | --- |
| `progress.md` | Estado de fases + log de respuestas |
| `spec.md` | Qué / por qué / stories / contratos / reglas |
| `plan.md` | Borrador en fase 6 |
| `tasks.md` | Checklist en fase 6 |
| `roadmap.md` | Fila al crear feature; status al aprobar |

Copiar `spec/features/_template/` → `spec/features/00N-<slug>/` en la fase 1.

## Formato de respuesta al usuario

Título de fase, preguntas numeradas (o AskQuestion), separador, bloque **Ya escrito** con rutas, **Siguiente** con la fase que sigue.

## Retomar

Si `progress.md` tiene fases `done`, resumir lo acordado y continuar en la primera `pending` o `in_progress`.
