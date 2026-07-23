---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: '1.1'
  generatedBy: '1.6.0'
---

Implement tasks from an OpenSpec change — **one reviewable task (or minimal approved batch) per turn**.

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx:apply <other>`).

2. **Check status to understand the schema**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, and `actionContext`: planning scope and edit constraints
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema - could be proposal/specs/design/tasks or spec/tests/implementation/docs)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using openspec-continue-change
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Show current progress and pick the next task**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview (short list)
   - Which **single** pending task will be implemented next

   If the next task (or how to implement it) is ambiguous — scope, approach, UX, API shape, which layer first — use the **AskQuestion tool** to let the user decide **before** writing code. Do not guess product decisions.

6. **Implement ONE task, then pause**

   Default: implement **exactly one** pending task per invocation / turn.

   For that task:
   - Show which task is being worked on (e.g. "Working on task 3/7: …")
   - Make the code changes required
   - Keep changes minimal and focused on that task only
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Summarize what changed and how to verify it
   - **STOP** and ask whether to continue with the next task

   **Do NOT** loop through the rest of the backlog in the same turn.

   **Continue automatically only if** the user explicitly says so in this turn, e.g.:
   - "seguí", "siguiente", "todas", "hacelo todo", "de una", "continue", "all tasks"
   - Or approves a specific batch ("hacé las 2 y 3")

   For **trivial** changes (1–2 files, one concern, few tasks): still prefer one task, but a tiny multi-checkbox batch is OK if each checkbox is not independently reviewable alone.

   **Pause immediately (and use AskQuestion when choices exist) if:**
   - Task or requirements are unclear
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

7. **On completion or pause, show status**

   Display:
   - Tasks completed this session (usually one)
   - Overall progress: "N/M tasks complete"
   - If all done: suggest archive
   - If paused after a task: name the next pending task and ask to continue
   - If paused on issue: explain why and wait for guidance

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

**Progress:** N/M tasks complete
**This turn:** task K/M — <task description>

[...implementation...]

✓ Task K complete

### Qué cambió
- …

### Cómo probar
- …

**Siguiente:** task K+1 — <description>

¿Seguimos con la siguiente tarea? (Decí "seguí" / "todas" para no pausar en cada una.)
```

**Output On Completion**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task …

All tasks complete! Ready to archive this change.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

(Use AskQuestion when presenting these options.)
```

**Guardrails**

- **One task per turn** by default — never ship an entire large feature in one apply pass
- Always read context files before starting (from the apply instructions output)
- If the request, task, or design choice is ambiguous, use **AskQuestion** — do not invent product decisions
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to the current task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
- Use contextFiles from CLI output, don't assume specific file names
- Respect explicit "do everything" / "todas" overrides from the user

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
- **Incremental delivery**: Re-invoke `/opsx:apply` (or say "seguí") for each next task
