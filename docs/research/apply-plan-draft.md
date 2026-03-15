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
node .\scripts\mip.mjs plan apply --format json --output .\apply-plan.json
```

## Current Decision Model

- `fact` with evidence, safe source, and safe target_path: `eligible_for_future_apply`
- addressable fact outside the current safe subset: `review_only`
- `observation`: `review_only`
- `pending_confirmation`: `confirmation_required`
- any suggestion without `target_path`: `blocked`
- malformed fact without evidence: `blocked`

## Why This Matters

This layer makes the write boundary concrete without claiming safe merge behavior that does not exist yet.
It also makes two current constraints explicit: future merge behavior needs `target_path`, and only a narrow safe subset should even be considered for later apply semantics.
