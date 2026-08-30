---
name: /sdd-propose
id: sdd-propose
category: Workflow
description: Create the three SDD artifacts for a new feature
---

Create or update an SDD feature for: $ARGUMENTS

Read `AGENTS.md`, `spec/README.md`, and `spec/constitution/` first. Before drafting, delegate exploration of the relevant code to a subagent. Require it to return the architecture, existing patterns, affected files, dependencies, and risks to this main thread; use that report to create the next available `spec/features/active/<NNN-slug>/` folder with exactly `spec.md`, `plan.md`, and `tasks.md`. Do not create progress files, proposal files, design files, or delta specs. Present the artifacts for user review before implementation unless the user explicitly asks otherwise.
