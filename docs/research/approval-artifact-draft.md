# Approval Artifact Draft

- Status: Draft
- Scope: non-mutating approval object built from an apply plan

## Goal

Turn apply-plan output into a durable artifact that separates:

- candidates ready for confirmation
- conflicts that need explicit review
- entries that should be skipped

## Command Shape

```powershell
node .\scripts\mip.mjs draft approval --input $HOME\.mip\plans\apply-plan.json
```

## Output Shape

The current draft groups plan entries into:

- `ready_for_confirmation`
- `conflicts`
- `skipped.no_op`
- `skipped.review_only`
- `skipped.blocked`
- `skipped.confirmation_required`
- `skipped.memory_unavailable`

## Why This Matters

This gives Route 2 a proper handoff artifact before any future mutation exists.
Without it, approval would remain implicit and difficult to audit.
