# MIP — 记忆互操作协议 (Memory Interoperability Protocol)

<p align="center">
  <strong>一个可移植的、用户拥有的 AI 记忆开放标准。</strong>
</p>

<p align="center">
  简体中文 | <a href="./README.md">English</a>
</p>

---

## 问题

你花了几个月教 ChatGPT 了解你是 React 开发者、喜欢简洁回复。换到 Claude？从零开始。

**你的 AI 记忆被锁在每个平台里了。** MIP 要把它解锁。

## 什么是 MIP？

MIP 是一个极简的开放约定：

> **用户在本地维护一个 JSON 文件（`~/.mip/memory.json`），任何 AI 产品都可以读取它来了解用户。**

没有守护进程，没有数据库，没有服务端。就一个文件。

## 快速上手

### 1. 创建你的记忆文件

```bash
mkdir -p ~/.mip
```

```jsonc
// ~/.mip/memory.json
{
  "$schema": "https://mip-protocol.org/v0.1/schema.json",
  "version": "0.1.0",
  "identity": {
    "name": "张三",
    "language": "zh-CN",
    "role": "前端工程师",
    "tech_stack": ["React", "TypeScript", "Next.js"]
  },
  "preferences": {
    "response_style": "concise",
    "formality": "casual",
    "explanation_depth": "intermediate"
  },
  "custom": {
    "编辑器": "VS Code",
    "关注领域": ["AI 应用开发", "Web3", "产品设计"]
  }
}
```

### 2. AI 产品集成（3 行代码）

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

### 3. 或通过 MCP Server 接入

支持 [MCP](https://modelcontextprotocol.io) 的 AI 产品，可以直接将 MIP 作为 MCP Server 接入：

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

详见 [mcp-server/](./mcp-server/)。

## 项目结构

```
MIP/
├── RFC-0001-MIP.md              # MVP 规范
├── RFC-0001-MIP-full-vision.md  # 完整愿景 (归档)
├── schemas/
│   └── memory.schema.json       # JSON Schema 定义
├── examples/
│   └── memory.json              # 示例记忆文件
└── mcp-server/                  # MCP Server 概念验证
    ├── index.js
    ├── package.json
    └── README.md
```

## 设计原则

| 原则 | 实现方式 |
|---|---|
| **零依赖** | 纯 JSON 文件，任何语言 3 行代码即可读取 |
| **用户拥有** | 文件在你的机器上，想改就改 |
| **渐进增强** | `identity` 和 `preferences` 是标准字段，`custom` 自由扩展 |
| **向后兼容** | 未来版本只新增字段，不删除不改动 |

## 演进路线

| 版本 | 新增能力 |
|---|---|
| **v0.1**（当前） | 单文件、只读为主、无权限 |
| v0.2 | 行为模式层 |
| v0.3 | 权限模型 |
| v0.4 | 本地 Runtime 守护进程 |
| v0.5 | 跨设备加密同步 |
| v1.0 | 完整规范（参见[完整愿景](./RFC-0001-MIP-full-vision.md)） |

## 参与贡献

这是一个早期阶段的提案，欢迎各种形式的贡献：

- 💡 **想法建议** — 提交 [Issue](https://github.com/UnCooe/MIP/issues) 讨论
- 📝 **RFC 评审** — 对[规范文档](./RFC-0001-MIP.md)提出意见
- 🔧 **客户端实现** — 为你喜欢的 AI 工具构建 MIP 客户端
- 🌍 **翻译** — 帮助翻译文档到更多语言

## 许可证

[CC-BY-SA 4.0](./LICENSE)
