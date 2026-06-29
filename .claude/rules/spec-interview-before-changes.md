# Spec interview antes de cada cambio nuevo

Cuando el usuario pida un **cambio nuevo**, **feature nueva**, o **ampliación de alcance**, ejecutar la entrevista de [spec/INTERVIEW.md](../../spec/INTERVIEW.md) **antes** de escribir código o actualizar `plan.md`/`tasks.md`.

Skill de referencia: `.claude/skills/spec-interview/SKILL.md`.

## Disparadores

- "quiero que…", "agregá…", "nueva feature", "creá spec", "implementá…"
- Cualquier pedido que agregue comportamiento, endpoints, pantallas o reglas de negocio no cubiertas por la spec actual

## Comportamiento

1. Leer `spec/INTERVIEW.md` y, si existe feature relacionada, `spec/features/00N-<slug>/progress.md`.
2. **Una fase por turno** (máx. ~5 preguntas). Usar `AskUserQuestion` para opciones finitas.
3. Pre-rellenar desde código/roadmap y **confirmar** con el usuario.
4. Actualizar `progress.md` y `spec.md` tras cada fase; `plan.md`/`tasks.md` en fase 6.
5. **No implementar código** hasta spec `approved` o pedido explícito del usuario.

## Excepciones

- **Retomar**: continuar desde la primera fase `pending` en `progress.md`.
- **Cambio acotado** sobre spec ya `approved`: entrevista solo en las secciones afectadas (decirlo al usuario).
- **"seguí con lo que tengas" / "inferí vos"**: documentar supuestos en *Preguntas abiertas*.

## Formato de respuesta

```markdown
## Fase N — [nombre]
[preguntas]
---
**Ya escrito:** `spec/features/…`
**Siguiente:** fase N+1
```
