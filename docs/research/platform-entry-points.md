# Platform Entry Point Map

- Last reviewed: 2026-03-15
- Scope: read-path validation for Route 1

## Why This Exists

MIP only helps when a target tool has a real place to consume user context.
A renderer by itself does nothing unless it can write to a location the tool actually reads.

This document tracks currently known entry points and their likely reliability.

## Reading Guarantee Levels

- Strong: documented global or project entry point that the tool is expected to load
- Medium: documented project or context mechanism, but practical behavior can still vary by flow
- Weak: no stable documented entry point; likely requires manual injection or wrapper behavior
- Experimental: observed in local testing or third-party guidance, but not yet backed by a clean primary source

## Claude Code

### Known entry points
- Global memory file: `~/.claude/CLAUDE.md`
- Project memory file: `./CLAUDE.md`
- Local project memory file: `./CLAUDE.local.md`
- Imports supported via `@path/to/file`

### Notes
Anthropic documents these as memory files Claude Code reads. The documentation also describes the `/memory` command and the `/init` command to bootstrap project memory files.

### Initial assessment
- Global path: Strong
- Project path: Strong

### Source
- [Claude Code memory docs](https://docs.anthropic.com/en/docs/claude-code/memory)

## Cursor

### Known entry points
- User Rules
- Project Rules under `.cursor/rules`
- `AGENTS.md`

### Notes
Cursor documents User Rules as always applied and intended for global preferences. Cursor also documents project-specific rules and explicitly mentions support for `AGENTS.md`.

### Initial assessment
- User Rules: Strong
- `.cursor/rules`: Strong
- `AGENTS.md`: Medium to Strong

### Sources
- [Cursor rules docs](https://docs.cursor.com/context/rules)
- [Cursor context overview](https://docs.cursor.com/en/context)

## Codex

### Known entry points
- `AGENTS.md` inside the repository is a confirmed project-level entry point

### Notes
OpenAI's public Codex material explicitly references `AGENTS.md` as a way to guide Codex in a repository. A similarly explicit official user-level global rules file was not confirmed in this review.

### Initial assessment
- `AGENTS.md`: Strong for project-level guidance
- Global user-level path: Unconfirmed

### Sources
- [Introducing Codex](https://openai.com/index/introducing-codex/)
- [openai/codex repository](https://github.com/openai/codex)

## Antigravity

### Known entry points
- Project-directory context reading is locally observed
- Global rules and workspace rules are described in third-party guides, but a clean primary-source reference was not confirmed in this review

### Notes
Local testing by the user indicates Antigravity reads project-local context files. That is useful evidence for experimentation, but not enough to claim a stable official integration contract yet.

### Initial assessment
- Project-directory guidance via `AGENTS.md` + `MIP-CONTEXT.md`: Experimental
- Official global or workspace rule path: Unconfirmed

### Sources
- Local validation in this workspace
- Third-party guides observed during research, not treated as authoritative enough for a stronger label

## MCP-capable clients

### Known entry points
- Configured MCP servers
- Resource and tool calls exposed by those servers

### Notes
MCP is not a passive memory file mechanism. It only works when the client both supports MCP and has the server configured. Once configured, it provides a structured read path and a possible governed write path.

### Initial assessment
- MCP resource access: Strong when configured, otherwise unavailable

## Implications For Route 1

1. MIP should prioritize platform-native global entry points when they exist.
2. Project-level files remain necessary for tools like Codex where project entry points are clearer than global ones.
3. Antigravity can be explored as an experimental target using project-local context, but should not yet be presented as a fully verified official integration.
4. MCP is complementary, not a replacement for native read paths.
5. The renderer should target verified entry points instead of assuming one universal file works everywhere.

## Open Questions

- Does Codex expose an official global user rules path beyond repository-level guidance?
- Does Antigravity publish a primary-source definition of its stable rule or memory file entry points?
- Which tools merge multiple sources versus picking one dominant source?
- How should MIP handle platforms where the only reliable path is manual first-message injection?