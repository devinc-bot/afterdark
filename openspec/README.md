# OpenSpec en afterdark

Guía práctica de cómo trabajamos con **OpenSpec**: desarrollo spec-driven (SDD) donde acordamos
**qué** vamos a construir antes de escribir código. OpenSpec es el flujo por defecto para toda
feature o cambio de alcance nuevo.

- Sitio: <https://openspec.dev/> · Repo: <https://github.com/Fission-AI/OpenSpec>
- Config del proyecto: [`openspec/config.yaml`](./config.yaml)
- Regla del agente (se aplica siempre): [`.cursor/rules/spec-interview-before-changes.mdc`](../.cursor/rules/spec-interview-before-changes.mdc)

---

## Idea en 30 segundos

En vez de tirarle a la IA un prompt vago y que "adivine", primero generamos un **cambio** (change)
con la propuesta, las specs y las tareas. Vos revisás ese plan; recién después se codea.

```text
/opsx:explore            # (opcional) pensar el enfoque leyendo el código
/opsx:propose <slug>     # crea openspec/changes/<slug>/ con el plan completo
                         # → revisás la propuesta ANTES de codear
/opsx:apply              # implementa las tareas de tasks.md
/opsx:archive            # mergea las specs y archiva el cambio
```

- Los comandos **`/opsx:*` se escriben en el chat del asistente** (Cursor).
- El **CLI se usa en la terminal**: `pnpm openspec <cmd>`.

---

## Dónde vive todo

```text
openspec/
├── README.md            # esta guía
├── config.yaml          # contexto del repo + reglas por artefacto (se inyectan a la IA)
├── specs/               # fuente de verdad: cómo se comporta el sistema (crece con cada cambio)
│   └── <dominio>/
│       └── spec.md
└── changes/             # cambios en curso (uno por carpeta)
    ├── <slug>/
    │   ├── proposal.md  # por qué y qué (intención, alcance, non-goals)
    │   ├── specs/       # DELTAS: qué requisitos se agregan/modifican/eliminan
    │   │   └── <dominio>/spec.md
    │   ├── design.md    # cómo (decisiones técnicas, capas, migraciones)
    │   └── tasks.md     # checklist de implementación
    └── archive/         # cambios ya aplicados (histórico)
        └── YYYY-MM-DD-<slug>/
```

> `specs/` y `changes/` se crean al generar tu primer cambio. Todo `openspec/` se commitea a git.

---

## Comandos del chat (`/opsx:*`)

Perfil **expanded** activo (12 workflows). Se escriben en el chat de Cursor.

| Comando | Para qué sirve |
| --- | --- |
| `/opsx:explore` | Compañero de análisis sin compromiso: lee el código, sopesa opciones y acota un enfoque antes de proponer nada. Ideal cuando el área es grande o incierta. |
| `/opsx:propose <slug>` | Crea el cambio completo de una: `proposal.md`, `specs/` (deltas), `design.md` y `tasks.md`. Punto de entrada cuando ya sabés qué querés. |
| `/opsx:new <slug>` | Crea el cambio vacío/mínimo para irlo llenando artefacto por artefacto (flujo granular, alternativa a `propose`). |
| `/opsx:continue` | Genera/actualiza el **siguiente** artefacto pendiente del cambio activo, de a uno. |
| `/opsx:ff` | "Fast-forward": completa todos los artefactos restantes del cambio de una pasada. |
| `/opsx:apply` | Implementa las tareas de `tasks.md`, marcándolas a medida que avanza. |
| `/opsx:verify` | Revisa que la implementación cumpla la propuesta/specs antes de archivar. |
| `/opsx:sync` | Reconcilia specs y artefactos cuando hubo ediciones manuales o quedaron desalineados. |
| `/opsx:archive` | Cierra el cambio: mergea los deltas a `openspec/specs/` y lo mueve a `changes/archive/`. |
| `/opsx:bulk-archive` | Archiva varios cambios completados de una vez. |
| `/opsx:onboard` | Tour guiado: busca una mejora chica y segura y te lleva por todo el ciclo explicando cada paso. |
| `/opsx:update` | Regenera las instrucciones/comandos del asistente (tras actualizar OpenSpec o cambiar el perfil). |

**Flujo típico:** `explore` (opcional) → `propose` → *revisar* → `apply` → `verify` → `archive`.

---

## Comandos del CLI (`pnpm openspec <cmd>`)

En la terminal. Los más usados:

| Comando | Para qué sirve |
| --- | --- |
| `pnpm openspec list` | Lista los cambios activos. Con `--specs` lista las specs. |
| `pnpm openspec show <item>` | Muestra un cambio o una spec. |
| `pnpm openspec view` | Dashboard interactivo de specs y cambios. |
| `pnpm openspec status` | Estado de completitud de los artefactos de un cambio. |
| `pnpm openspec validate [item]` | Valida formato de cambios y specs. |
| `pnpm openspec doctor` | Chequea la salud del root de OpenSpec. |
| `pnpm openspec context` | Imprime el contexto de trabajo resuelto (lo que "ve" la IA). |
| `pnpm openspec archive [change]` | Archiva un cambio desde la terminal. |
| `pnpm openspec config list` | Muestra la config global (perfil, workflows, delivery). |
| `pnpm openspec update` | Actualiza los archivos de instrucciones del proyecto. |
| `pnpm openspec --help` | Ayuda general; `pnpm openspec <cmd> --help` para cada subcomando. |

> Nota: usá siempre `pnpm openspec ...` (o `pnpm exec openspec ...`); así corre la versión pineada del repo.

---

## Anatomía de un cambio

Cada carpeta en `openspec/changes/<slug>/` tiene estos artefactos, que se construyen uno sobre otro:

| Artefacto | Contenido |
| --- | --- |
| `proposal.md` | El **por qué** y el **qué**: intención, alcance, *non-goals*, apps/paquetes afectados. |
| `specs/` | Los **deltas**: requisitos que se agregan/modifican/eliminan, con escenarios Given/When/Then. |
| `design.md` | El **cómo**: decisiones técnicas, capas, repositories, migraciones, claves i18n. |
| `tasks.md` | Checklist de implementación (se tilda al aplicar). |

### Deltas: solo lo que cambia

OpenSpec es **brownfield-first**: no describís todo el sistema, solo el diff respecto al comportamiento
actual. Los deltas se escriben con estas secciones:

```markdown
## ADDED Requirements

### Requirement: Nombre del requisito
El sistema DEBE ...

#### Scenario: Caso concreto
- GIVEN una precondición
- WHEN ocurre algo
- THEN pasa este resultado

## MODIFIED Requirements
### Requirement: Requisito existente
(nueva definición que reemplaza a la anterior)

## REMOVED Requirements
### Requirement: Requisito viejo
(motivo de la baja)
```

Al **archivar**: los `ADDED` se agregan a la spec principal, los `MODIFIED` la reemplazan y los
`REMOVED` se borran. El cambio pasa a `changes/archive/`.

---

## Convenciones de afterdark

Estas reglas ya están en [`openspec/config.yaml`](./config.yaml) y se inyectan automáticamente al
generar cada artefacto:

- **Copy de UI y mensajes de error en español**; identificadores, rutas y texto técnico de requisitos en inglés.
- **Validación** vía `@afterdark/validators` (Zod v4); no duplicar reglas en prosa.
- **Acceso a DB desde la API** siempre por un repository en `packages/db/src/repositories/` (nunca `db` directo).
- **Migraciones** con `drizzle-kit`, prefijo timestamp; no renombrar migraciones ya commiteadas.
- **Lint/format**: oxlint + oxfmt; cada tarea debe pasar ambos.
- **Orden de tareas** por capa: `types/validators → db/migración → API → dashboard/UI → i18n`.
- Cada `proposal.md` incluye una sección **Non-goals** para evitar scope creep.

### Specs legacy (`spec/`)

Las specs anteriores en `spec/features/NNN-*/` quedan como **referencia/histórico**. Una feature se
migra a `openspec/specs/` **solo cuando se la vuelve a tocar** (escribiendo el delta correspondiente);
no back-filleamos todo de una vez.

---

## Setup y notas

- OpenSpec está instalado como devDependency (`@fission-ai/openspec`). Se corre con `pnpm openspec`.
- En `pnpm-workspace.yaml`, `allowBuilds['@fission-ai/openspec']: false` (su postinstall es solo un aviso
  de telemetría; deshabilitarlo evita que `pnpm install`/`pnpm exec` fallen por `strictDepBuilds`).
- Tras `openspec init`/`update` **reiniciá el IDE** para que aparezcan los slash `/opsx:*`.
- Los comandos y skills viven commiteados en `.cursor/commands/opsx-*.md` y `.cursor/skills/openspec-*/`.

> **Perfil expanded:** los 12 workflows viven en la config **global** de OpenSpec (`%AppData%/openspec/config.json`,
> no versionada). Los comandos ya están commiteados, así que el equipo los recibe por git. Pero si alguien
> corre `openspec update` con su perfil en `core`, se regenerarían solo los 6 comandos core. Para tener los
> 12: `openspec config profile` → elegir `custom` con todos los workflows, luego `openspec update`.

---

## Recursos

- [Getting Started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md)
- [Existing Projects (brownfield)](https://github.com/Fission-AI/OpenSpec/blob/main/docs/existing-projects.md)
- [Customization](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md)
