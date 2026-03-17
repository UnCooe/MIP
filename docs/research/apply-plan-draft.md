# Apply Plan Draft

- Status: Draft
- Scope: non-mutating gating layer before any future apply command

## Goal

Turn a review bundle into an explicit apply plan that classifies each suggestion without mutating the user's memory source.

## Command Shape

```powershell
node .\scripts\mip.mjs plan apply
```

Optional machine-readable form:

```powershell
node .\scripts\mip.mjs plan apply --memory $HOME\.mip\memory.json --format json --output $HOME\.mip\plans\apply-plan.json
```

## Current Decision Model

- `fact` with evidence, safe source, and safe target_path: `eligible_for_future_apply`
- addressable fact outside the current safe subset: `review_only`
- `observation`: `review_only`
- `pending_confirmation`: `confirmation_required`
- any suggestion without `target_path`: `blocked`
- malformed fact without evidence: `blocked`

For `eligible_for_future_apply` candidates, the plan now also compares against current memory state:

- `apply_ready`
- `no_op`
- `conflict`
- `memory_unavailable`

## Why This Matters

This layer makes the write boundary concrete without claiming safe merge behavior that does not exist yet.
It also makes four current constraints explicit: future merge behavior needs `target_path`, only a narrow safe subset should even be considered for later apply semantics, each safe path needs an explicit merge strategy, and current-memory diffing must happen before any mutation step.
