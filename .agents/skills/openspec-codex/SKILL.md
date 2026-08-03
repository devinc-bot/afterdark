---
name: openspec-codex
description: Manage this repository's OpenSpec lifecycle: explore, create or propose a change, continue planning, apply tasks incrementally, update, verify, sync, and archive. Use when the user names an OpenSpec mode such as `/opsx-apply`, asks to work on an OpenSpec change or spec, or requests a non-trivial feature, scope change, or broad refactor in this repository.
---

# OpenSpec workflow

Use `pnpm openspec` from the repository root. Treat `openspec/config.yaml` as the source of project and artifact rules. Use paths emitted by OpenSpec commands; do not assume a fixed schema or artifact layout.

For a new behavior or scope change, complete and align the planning artifacts before changing implementation code. Use deltas against `openspec/specs/`, not backfilled specifications.

## Interaction rules

- If a decision materially changes scope or intent, ask a concise question before writing. Use the native question tool when it is available; otherwise ask plainly in chat. Do not pretend that a question UI appeared.
- A trivial 1–2-file bug fix without new behavior may be implemented directly.
- Keep UI copy and errors in Spanish; keep identifiers, routes, and technical requirements in English.
- For `apply`, implement one unchecked task per turn and pause for review. Continue in bulk only when the user explicitly says “seguí”, “siguiente”, “todas”, or equivalent.
- Read the referenced project documents from `openspec/config.yaml` before drafting artifacts.
- Prefer task order by layer: types/validators, database/migration, API, dashboard/UI, cross-app consumers, then i18n.
- Do not implement code until the proposal and required planning artifacts have been reviewed, except for trivial fixes or an explicit user override.

## Command modes

Interpret `/opsx:<mode>`, `/opsx-<mode>`, or the natural-language operation below as a mode. If the change is not supplied and cannot safely be inferred, run `pnpm openspec list --json` and ask the user to select one.

| Mode | Procedure |
| --- | --- |
| `explore` | Read the relevant code, docs, existing specs, and active changes. Do not edit. Report current behavior, affected surfaces, risks, and a bounded recommended approach. |
| `new` | Validate a kebab-case change name, create the change with `pnpm openspec new change <name>`, then show its status and guide the user to `propose` or `continue`. |
| `propose` | Resolve the change status, then create each required planning artifact in dependency order. For every artifact, run `pnpm openspec instructions <artifact-id> --change <name> --json`, follow its template and rules, and re-run `status --json`. Finish only when all artifacts required for `apply` are done. Present the proposal, scope, non-goals, affected apps/packages, and delta specs for user review before code. |
| `continue` | Create only the next ready planning artifact(s), following `status --json` and `instructions`. Do not implement code. |
| `apply` | Read `pnpm openspec instructions apply --change <name> --json` and all returned context files. Locate the first unchecked task and implement exactly that task, including relevant tests and checks. Mark it complete only after verification, summarize it, and pause. |
| `update` | Revise existing planning artifacts only. Read all existing artifacts, identify inconsistencies, show each proposed revision and why, and write only revisions the user confirms. Never create new artifacts or edit implementation code in this mode. |
| `verify` | Compare implementation with the tasks, delta requirements/scenarios, and design context returned by `instructions apply`. Report completeness, correctness, and coherence, separating critical issues, warnings, and suggestions with concrete evidence. |
| `sync` | Read each delta spec and its canonical `openspec/specs/<capability>/spec.md`, then intelligently apply ADDED, MODIFIED, REMOVED, and RENAMED sections without overwriting unrelated content. |
| `archive` | Confirm planning is complete and implementation has no unchecked tasks. Run the relevant validation, archive with the OpenSpec CLI, and report the archive location. |
| `bulk-archive` | List eligible completed changes, ask which changes to archive, validate each one, and archive only the selected valid changes. |
| `ff` | Use an expedited planning pass only when the user explicitly requests it. Still create coherent, reviewable planning artifacts and state assumptions; never skip required OpenSpec validation. |
| `onboard` | Teach one complete workflow cycle using a small real repository task. Pause after exploration, proposal, tasks, and each implementation task; do not use Cursor-specific UI or slash-command assumptions. |

## Dynamic artifact handling

Use `pnpm openspec status --change <name> --json` to obtain `schemaName`, `artifactPaths`, `planningHome`, and concrete `existingOutputPaths`. For glob artifacts, only edit the concrete output paths; never write to a glob `resolvedOutputPath`.

For a named external store, first discover it with `pnpm openspec store list --json`, then carry the returned `--store <id>` flag into commands that read or write changes or specs.

## Validation and handoff

Run `pnpm openspec validate` after planning or sync changes and the relevant repository checks after implementation. Preserve legacy `spec/features/` as historical reference; migrate only a feature that the change touches.

In OpenCode, invoke this workflow with `$openspec-codex` and state the desired mode, for example: `$openspec-codex propose ticket-payments`. Project commands under `.opencode/commands/` provide the same modes as `/opsx-<mode>` shortcuts.
