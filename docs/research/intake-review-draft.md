# Intake Review Draft

- Status: Draft
- Scope: human-readable review for intake drafts

## Goal

Make intake drafts easy to inspect before converting them into an initial memory candidate.

## Command Shape

```powershell
node .\scripts\mip.mjs review intake --input .\.mip-intake\intake-draft.json
```

Optional Markdown output:

```powershell
node .\scripts\mip.mjs review intake --format markdown --output .\intake-review.md
```

## Review Contents

- source files
- extracted candidates
- proposed memory object
- extraction notes

## Why This Matters

This gives the initialization flow a real human checkpoint instead of making the user read raw JSON or trust the extraction blindly.
