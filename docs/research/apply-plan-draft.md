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

- `fact` with evidence and source: `eligible_for_future_apply`
- `observation`: `review_only`
- `pending_confirmation`: `confirmation_required`
- any suggestion without `target_path`: `blocked`
- malformed fact without evidence: `blocked`

## Why This Matters

This layer makes the write boundary concrete without claiming safe merge behavior that does not exist yet.
It also makes the current constraint explicit: future merge behavior needs `target_path`, not just a human-readable free-form key.
