# MIP: Memory Interoperability Protocol

<p align="center">
  <strong>A portable, user-owned <code>memory.json</code> standard any AI app can read.</strong>
</p>

<p align="center">
  <a href="./README.zh-CN.md">Simplified Chinese</a> | English
</p>

<p align="center">
  <img src="./assets/mip-poster-zh.png" alt="MIP poster" width="760" />
</p>
---

## Why MIP exists

AI tools are getting better at remembering you.

That memory is usually trapped inside each product.

You teach ChatGPT your preferences. Switch to Claude or a local agent, and you start over. Switch back three months later, and the old product may remember an outdated version of you.

MIP is a small open convention that fixes the portability layer:

> Keep one local file at `~/.mip/memory.json`. Any AI product can read it to understand you.

No daemon. No hosted service. No database. Just a file.

## What MIP is

MIP v0.1 is a minimal standard for explicit user memory:

- identity
- preferences
- custom user-defined fields

It is intentionally small. The goal is not to solve all memory problems in v0.1. The goal is to create a stable portability baseline that tools can adopt quickly.

## What MIP is not

- Not a memory product like Mem0 or Letta
- Not a hosted profile sync service
- Not a replacement for tool-specific rules like `.cursorrules` or `CLAUDE.md`

Those are implementations or product-specific conventions. MIP is the shared format.

## Quick example

```jsonc
// ~/.mip/memory.json
{
  "$schema": "https://mip-protocol.org/v0.1/schema.json",
  "version": "0.1.0",
  "identity": {
    "name": "Jane",
    "language": "en-US",
    "role": "Frontend Engineer",
    "tech_stack": ["React", "TypeScript", "Next.js"]
  },
  "preferences": {
    "response_style": "concise",
    "formality": "casual",
    "code_comments_language": "zh-CN",
    "variable_names_language": "en"
  },
  "custom": {
    "editor": "VS Code",
    "interests": ["AI", "Web3", "Design"]
  }
}
```

## Read it in 3 lines

**Python**

```python
import json, pathlib
path = pathlib.Path.home() / ".mip" / "memory.json"
memory = json.loads(path.read_text()) if path.exists() else {}
```

**JavaScript**

```javascript
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
const path = `${homedir()}/.mip/memory.json`;
const memory = existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : {};
```

## Why this matters

- User-owned: your memory lives on your machine, not only inside one vendor
- Portable: multiple AI tools can read the same profile
- Simple: adoption cost is extremely low
- Forward-compatible: future versions can add richer memory layers without breaking v0.1

Think of it as `.editorconfig` for AI memory.

## Adoption paths

The easiest tools to support MIP are:

1. IDE agents and local coding tools
2. Open-source AI clients
3. MCP-enabled apps
4. Local model runtimes and wrappers

These tools already run on your machine and can read local files with almost no integration cost.

## MIP and MCP

MCP and MIP solve different problems:

- MCP answers: what tools can the AI use?
- MIP answers: who is the user?

MIP can work without MCP. For MCP-enabled apps, MIP can also be exposed through the included proof-of-concept server in [mcp-server/](./mcp-server/).

```json
{
  "mcpServers": {
    "mip": {
      "command": "node",
      "args": ["path/to/mip-server/index.js"]
    }
  }
}
```

## Repository contents

- [RFC-0001-MIP.md](./RFC-0001-MIP.md): MVP specification
- [RFC-0001-MIP-full-vision.md](./RFC-0001-MIP-full-vision.md): long-term vision
- [schemas/memory.schema.json](./schemas/memory.schema.json): JSON Schema
- [examples/memory.json](./examples/memory.json): example file
- [mcp-server/](./mcp-server/): MCP proof of concept

## Roadmap

| Version | Focus |
|---|---|
| **v0.1** | Single local file, explicit user memory, read-mostly |
| v0.2 | Behavioral patterns layer |
| v0.3 | Permissions and visibility controls |
| v0.4 | Local runtime daemon |
| v0.5 | Encrypted cross-device sync |
| v1.0 | Full specification |

## Contributing

MIP is early. The best contributions right now are:

- Implement read support in AI tools
- Review the RFC and schema
- Build adapters for MCP clients
- Challenge the model and point out edge cases

Open an [issue](https://github.com/UnCooe/MIP/issues) if you want to discuss adoption, semantics, or implementation details.

## License

[CC-BY-SA 4.0](./LICENSE)

