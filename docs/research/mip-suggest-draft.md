# MIP Suggest Draft

- Status: Draft
- Scope: local candidate generation only

## Goal

Provide a minimal command that creates a structured writeback suggestion without mutating the user's source of truth.

## Command Shape

```powershell
node .\scripts\mip.mjs suggest observation --target-path observations.communication_style --value direct --source conversation_pattern --confidence 0.78
```

## Output

The command writes one JSON file under `.mip-suggestions/` by default.
The payload is intentionally small:
- `schema`
- `class`
- `entry`

This keeps the first implementation easy to inspect and easy to discard if the format needs to change.

New suggestions should use `target_path` rather than a free-form key so later planning and merge logic can reason about where an update belongs.

## Why This Matters

This is the smallest real step from writeback theory to writeback workflow.
It proves that Route 2 can become executable without allowing unrestricted writes into `memory.json`.

## Draft Assets

- [Example suggestion](../../examples/suggestion.observation.json)
- [Route 2 writeback draft](./route-2-governed-writeback-draft.md)
