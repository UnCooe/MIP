# Review Bundle Draft

- Status: Draft
- Scope: human-readable review layer before any future apply step

## Goal

Turn a suggestion bundle into a readable review summary that humans can scan quickly.

## Command Shape

```powershell
node .\scripts\mip.mjs review bundle
```

## Output

The command prints a grouped summary in three sections:
- `fact`
- `observation`
- `pending_confirmation`

Each entry includes the suggestion file name and the metadata needed to judge whether it should eventually be accepted, revised, or rejected.

## Why This Matters

A JSON bundle is a useful machine artifact, but still awkward for manual review.
The review command creates a practical pause point before the project introduces any future apply behavior.