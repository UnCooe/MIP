# Docs Guide

If you are new to this repository, do not start by opening every file under `docs/`.

Read in this order:

1. repository `README.md`
2. `docs/evolution/`
3. `docs/decisions/README.md`
4. only then open specific `docs/research/` drafts when you need the detail

## What Each Area Is For

### `docs/evolution/`

Use this to understand the project's major strategic turns.

This is the shortest path for understanding "how MIP got here".

It should stay sparse.
Only major framing changes belong here.

### `docs/decisions/`

Use this to understand why the project chose a direction.

Each file should record:

- the decision
- why it was made
- the main tradeoff

Do not turn decision records into long design essays.

### `docs/research/`

Use this for working drafts, capability mapping, and implementation exploration.

This is allowed to be incomplete or temporary.
It is not the place to understand the whole project from scratch.

### `docs/maintenance-rules.md`

This is not project history.
This is the current operating policy for governed memory maintenance and future writeback behavior.

Think of it as:

- "how memory should be maintained"
- not "how the project evolved"

## Writing Rules

When adding docs:

- prefer one short file over three overlapping files
- record only the key reason and tradeoff
- avoid restating implementation details already visible in scripts
- avoid turning every small step into a public historical artifact

## Anti-Entropy Rule

The existence of a directory is not the same as readability.

If a new document does not clearly belong to one of the buckets above, do not add it until its role is clear.
