# Resolution Artifact Draft

- Status: Draft
- Scope: non-mutating record of user decisions built from an approval draft

## Goal

Capture explicit user decisions before any future apply command exists.

## Command Shape

```powershell
node .\scripts\mip.mjs draft resolution --input $HOME\.mip\approvals\approval-draft.json
```

## Output Shape

The current draft separates:

- `pending_confirmations`
- `pending_conflicts`
- `skipped`

Entries in `pending_confirmations` start with:

- `resolution: "pending_confirmation"`
- `allowed_resolutions: ["approve", "reject"]`

Entries in `pending_conflicts` start with:

- `resolution: "pending_conflict_decision"`
- `allowed_resolutions: ["keep_current", "use_proposed", "manual_edit"]`

## Why This Matters

This gives Route 2 a durable place to store final user intent before mutation exists.
Without it, future apply logic would still need to guess from approval-stage artifacts.
