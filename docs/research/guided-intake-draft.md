# Guided Intake Draft

- Status: Draft
- Scope: initializing MIP memory from open-ended user-provided sources

## Goal

Give users a low-cognitive-load way to turn raw materials into an initial MIP memory candidate.

## Current Draft Flow

1. `draft intake`
2. inspect or revise the intake draft
3. `build memory`

## Command Shape

```powershell
node .\scripts\mip.mjs draft intake --source-file .\resume.md --source-file .\assistant-rules.md
node .\scripts\mip.mjs build memory --input $HOME\.mip\intake\intake-draft.json --output $HOME\.mip\memory.json
```

## Current Extraction Scope

The first intake draft is intentionally narrow.
It extracts:

- known structured MIP-like sections from JSON
- known flat keys and line-based mappings from text

Anything not directly mapped is preserved as a note for further review instead of being silently discarded or invented.

## Why This Matters

This makes initialization usable now, while still leaving room for stronger extraction logic later.

## Asset Boundary

The intake draft is part of the user's portable asset home at `~/.mip/`.

It should not be treated as repository state or project state.
The repository provides the tooling.
The user asset home carries the durable memory source and its governance artifacts across machines and platforms.
