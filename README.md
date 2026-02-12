# MIP — Memory Interoperability Protocol

<p align="center">
  <strong>A portable, user-owned memory standard for AI.</strong>
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | English
</p>

---

## The Problem

You spent months teaching ChatGPT that you're a React developer who prefers concise replies. Switch to Claude? Start from zero.

**Your AI memory is locked inside each platform.** MIP unlocks it.

## What is MIP?

MIP is a dead-simple open convention:

> **You maintain a JSON file (`~/.mip/memory.json`) on your machine. Any AI product can read it to understand you.**

No daemon. No database. No server. Just a file.

## Quick Start

### 1. Create your memory file

```bash
mkdir -p ~/.mip
```

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
    "explanation_depth": "intermediate"
  },
  "custom": {
    "editor": "VS Code",
    "interests": ["AI", "Web3", "Design"]
  }
}
```

### 2. For AI products: Read it (3 lines)

**Python:**
```python
import json, pathlib
MIP_PATH = pathlib.Path.home() / ".mip" / "memory.json"
user_memory = json.loads(MIP_PATH.read_text()) if MIP_PATH.exists() else {}
```

**JavaScript:**
```javascript
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
const MIP_PATH = `${homedir()}/.mip/memory.json`;
const memory = existsSync(MIP_PATH) ? JSON.parse(readFileSync(MIP_PATH, 'utf-8')) : {};
```

### 3. Or use the MCP Server

For AI products that support [MCP](https://modelcontextprotocol.io), add MIP as an MCP server:

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

See [mcp-server/](./mcp-server/) for details.

## Project Structure

```
MIP/
├── RFC-0001-MIP.md              # MVP Specification
├── RFC-0001-MIP-full-vision.md  # Full Vision (archived)
├── schemas/
│   └── memory.schema.json       # JSON Schema definition
├── examples/
│   └── memory.json              # Example memory file
└── mcp-server/                  # MCP Server (proof of concept)
    ├── index.js
    ├── package.json
    └── README.md
```

## Design Principles

| Principle | How |
|---|---|
| **Zero dependency** | Plain JSON file — 3 lines of code to read |
| **User-owned** | Lives on your machine, you edit it directly |
| **Progressive** | `identity` & `preferences` are standard; `custom` is freeform |
| **Forward-compatible** | Future versions only add fields, never remove |

## Roadmap

| Version | What's New |
|---|---|
| **v0.1** (current) | Single file, read-mostly, no permissions |
| v0.2 | Behavioral patterns layer |
| v0.3 | Permission model (which AI can read what) |
| v0.4 | Local runtime daemon |
| v0.5 | Encrypted cross-device sync |
| v1.0 | Full spec (see [full vision](./RFC-0001-MIP-full-vision.md)) |

## Contributing

This is an early-stage proposal. We welcome all forms of contribution:

- 💡 **Ideas** — Open an [Issue](https://github.com/UnCooe/MIP/issues) to discuss
- 📝 **RFC Review** — Comment on the [specification](./RFC-0001-MIP.md)
- 🔧 **Implementations** — Build MIP clients for your favorite AI tool
- 🌍 **Translations** — Help translate docs into more languages

## License

[CC-BY-SA 4.0](./LICENSE)
