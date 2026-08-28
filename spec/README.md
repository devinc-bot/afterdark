# Spec-Driven Development

This repository plans product work in `spec/` before implementation.

```text
spec/
├── README.md
├── constitution/
│   ├── mission.md
│   ├── tech-stack.md
│   └── roadmap.md
└── features/
    ├── active/             # Proposed or in-progress work
    │   └── 001-feature-slug/
    │       ├── spec.md
    │       ├── plan.md
    │       └── tasks.md
    └── archive/            # Completed and verified work
        └── 001-feature-slug/
            ├── spec.md
            ├── plan.md
            └── tasks.md
```

## Lifecycle

1. `/sdd-propose <slug>` creates the next numbered feature folder under `features/active/`.
2. Review `spec.md`, `plan.md`, and `tasks.md` before implementation.
3. `/sdd-apply <slug>` completes one unchecked task at a time and marks it done after verification.
4. `/sdd-archive <slug>` confirms every task and acceptance criterion, then moves the folder to `features/archive/`.

## Artifact Rules

Every feature contains exactly these files:

| File       | Purpose                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| `spec.md`  | Intent, scope, non-goals, requirements, and Given/When/Then acceptance scenarios.      |
| `plan.md`  | Technical approach, affected layers, contracts, migrations, and verification strategy. |
| `tasks.md` | Ordered, independently reviewable implementation checklist.                            |

- Feature folders use `NNN-kebab-case`, for example `001-upload-avatar`.
- Requirements and technical content use English. UI copy and user-facing errors use Spanish.
- Reference `@repo/validators` instead of duplicating validation rules in prose.
- API persistence uses repositories in `packages/db`; see [DATABASE.md](../packages/db/DATABASE.md).
- Order `tasks.md` by layer: shared types and validators, database and migrations, API, then the affected
  client (`web`, `dashboard`, or `admin`) and i18n. Keep each task focused on one layer whenever possible.
- Do not create `progress.md`, proposal files, design files, or delta specs.

## Assistant Rules

1. Read `spec/constitution/`, `AGENTS.md`, and relevant product or database documentation before proposing a feature.
2. Do not implement scope outside the active feature without updating its artifacts first.
3. Ask a concise question for unresolved product decisions instead of silently deciding them.
4. Keep active and archived features separate; never overwrite an archived feature.
