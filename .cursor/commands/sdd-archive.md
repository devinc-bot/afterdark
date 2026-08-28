---
name: /sdd-archive
id: sdd-archive
category: Workflow
description: Verify and archive a completed SDD feature
---

Archive the completed SDD feature: $ARGUMENTS

Read its three artifacts under `spec/features/active/`. Confirm that every task is complete and the acceptance scenarios are satisfied, run relevant verification, then move the feature folder unchanged to `spec/features/archive/`. Do not archive incomplete work.
