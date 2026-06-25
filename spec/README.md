# Spec-driven development (SDD)

Estructura del repositorio para escribir specs antes de código.

```text
spec/
├── README.md
├── constitution/          # Qué construimos, con qué, en qué orden
│   ├── mission.md
│   ├── tech-stack.md
│   └── roadmap.md
└── features/                # Una carpeta numerada por feature
    ├── _template/           # Copiar para empezar
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    └── 001-<slug>/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## Flujo

1. **Constitution** — Completar una vez (o actualizar cuando cambie visión/stack/roadmap).
2. **Nueva feature** — Copiar `features/_template/` → `features/00N-<slug>/`.
3. **spec.md** — Qué hace y criterios de aceptación (`approved` antes de codear).
4. **plan.md** — Cómo se implementa (capas, archivos, contratos).
5. **tasks.md** — Checklist ejecutable; marcar tareas al avanzar.
6. **Implementar** — Seguir `plan.md` y tachar `tasks.md`.
7. **Cerrar** — Verificar criterios de `spec.md`; actualizar `roadmap.md`.

## Convenciones

| Qué | Regla |
| --- | ----- |
| Carpetas de feature | `001-upload-avatar`, `002-staff-invite` (número + kebab-case) |
| UI copy en specs | Español |
| Identificadores / rutas | Inglés |
| Validación | `@afterdark/validators` — no duplicar reglas en prosa |
| DB | Repositories en `packages/db` — ver [DATABASE.md](../packages/db/DATABASE.md) |

## Docs del repo

| Doc | Uso |
| --- | --- |
| [DOMAIN.md](../DOMAIN.md) | Negocio, entidades, idioma |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Módulos, capas, rutas |
| [STYLEGUIDE.md](../STYLEGUIDE.md) | Naming, lint, format |
| [AGENTS.md](../AGENTS.md) | Guía para asistentes IA |

## Para asistentes IA

1. Leer `spec/constitution/` antes de features nuevas.
2. Para implementar: leer `spec/features/<NNN-slug>/spec.md`, `plan.md` y `tasks.md`.
3. No implementar fuera de lo especificado sin actualizar la spec primero.
