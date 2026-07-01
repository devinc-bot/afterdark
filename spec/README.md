# Spec-driven development (SDD)

Estructura del repositorio para escribir specs antes de código.

```text
spec/
├── README.md
├── INTERVIEW.md           # ← Protocolo de entrevista guiada (leer al crear specs)
├── constitution/          # Qué construimos, con qué, en qué orden
│   ├── mission.md
│   ├── tech-stack.md
│   └── roadmap.md
└── features/                # Una carpeta numerada por feature
    ├── _template/           # Copiar para empezar
    │   ├── spec.md
    │   ├── plan.md
    │   ├── tasks.md
    │   └── progress.md      # Estado de la entrevista por fase
    └── 001-<slug>/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        └── progress.md
```

## Flujo

### Crear una spec (entrevista guiada)

Cuando pidas **crear una spec** (al asistente o en el chat), no se completa todo de golpe:

1. El asistente lee [INTERVIEW.md](./INTERVIEW.md) y hace **preguntas por fases** (identidad → alcance → stories → contratos → reglas → plan).
2. Con cada respuesta tuya, va **escribiendo** `spec/features/00N-<slug>/` y actualizando `progress.md`.
3. Podés decir _“seguimos con la spec de tickets”_ para **retomar** donde quedó.
4. Cuando la spec está lista, status → `approved`; recién ahí conviene implementar.

Disparadores útiles: _“creá la spec de …”_, _“nueva feature”_, _“completá la spec 006”_.

### Implementar

1. **Constitution** — Completar una vez (o actualizar cuando cambie visión/stack/roadmap).
2. **Nueva feature** — Entrevista → carpeta `features/00N-<slug>/` (no solo copiar template vacío).
3. **spec.md** — Qué hace y criterios de aceptación (`approved` antes de codear).
4. **plan.md** — Cómo se implementa (capas, archivos, contratos).
5. **tasks.md** — Checklist ejecutable; marcar tareas al avanzar.
6. **Implementar** — Seguir `plan.md` y tachar `tasks.md`.
7. **Cerrar** — Verificar criterios de `spec.md`; actualizar `roadmap.md`.

## Convenciones

| Qué                     | Regla                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| Carpetas de feature     | `001-upload-avatar`, `002-staff-invite` (número + kebab-case)                 |
| UI copy en specs        | Español                                                                       |
| Identificadores / rutas | Inglés                                                                        |
| Validación              | `@afterdark/validators` — no duplicar reglas en prosa                         |
| DB                      | Repositories en `packages/db` — ver [DATABASE.md](../packages/db/DATABASE.md) |
| Entrevista              | Una fase por turno; ver [INTERVIEW.md](./INTERVIEW.md)                        |

## Docs del repo

| Doc                                   | Uso                        |
| ------------------------------------- | -------------------------- |
| [DOMAIN.md](../DOMAIN.md)             | Negocio, entidades, idioma |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Módulos, capas, rutas      |
| [STYLEGUIDE.md](../STYLEGUIDE.md)     | Naming, lint, format       |
| [AGENTS.md](../AGENTS.md)             | Guía para asistentes IA    |

## Para asistentes IA

1. Leer `spec/constitution/` antes de features nuevas.
2. **Crear spec:** seguir [INTERVIEW.md](./INTERVIEW.md) y skill `spec-interview` — preguntar por fases, no rellenar solo.
3. **Implementar:** leer `spec/features/<NNN-slug>/spec.md`, `plan.md`, `tasks.md` y `progress.md`.
4. No implementar fuera de lo especificado sin actualizar la spec primero.
