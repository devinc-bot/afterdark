---
name: openspec-onboard
description: Teach the complete OpenSpec workflow through a small real repository task. Use when the user asks for onboarding, a tutorial, or a first guided OpenSpec cycle.
---

# OpenSpec onboarding

Guide the user through one real, small task in this repository. This is a teaching flow, not a simulation.

1. Check the CLI with `pnpm openspec doctor` and stop with a clear message if it is unavailable.
2. Scan the repository for a small candidate using TODO/FIXME markers, missing validation, debug artifacts, or an obvious test gap. Also inspect recent history.
3. Present three or four concrete candidates with location, scope, and rationale. Ask the user to choose or describe another task.
4. Explore the selected task without editing code. Explain the current behavior, affected files, and risks, then pause.
5. Create a kebab-case change with `pnpm openspec new change <name>` and create the required artifacts using the paths returned by `pnpm openspec instructions ... --json`.
6. Draft proposal, delta specs, design, and tasks. Include non-goals, affected apps/packages, and Given/When/Then scenarios. Pause for review before implementation.
7. Apply exactly one unchecked task per turn using the `openspec-codex` skill. Verify it, update its checkbox, summarize the result, and pause.
8. After all tasks are verified, run the relevant checks and archive only after the user confirms.

Use native question support when available; otherwise ask plainly in chat. Keep the flow editor-agnostic. Use `/opsx-<mode>` commands or `$openspec-codex <mode>` instead.

If the user wants to stop, report the change path from OpenSpec status and explain how to resume with `/opsx-continue <name>` or `/opsx-apply <name>`.
