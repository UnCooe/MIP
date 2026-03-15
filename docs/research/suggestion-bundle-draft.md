# Suggestion Bundle Draft

- Status: Draft
- Scope: review artifact before any future apply step

## Goal

Bundle multiple suggestion files into one review artifact so they can be inspected together before any merge or apply step exists.

## Command Shape

```powershell
node .\scripts\mip.mjs pack suggestions
```

## Output

By default the command reads `.mip-suggestions/` and writes `review-bundle.json` into the same directory.
The bundle includes:
- `schema`
- `created_at`
- `input_dir`
- `summary`
- `suggestions`

## Why This Matters

Single suggestions are useful for generation, but manual review becomes awkward as soon as there are multiple candidates.
A bundle is the first step toward a real approval workflow.

## Draft Assets

- [Example bundle](../../examples/suggestion.bundle.json)
- [Suggest draft](./mip-suggest-draft.md)