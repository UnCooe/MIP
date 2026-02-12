# RFC-0001: MIP — Memory Interoperability Protocol (MVP)

| 字段 | 值 |
|---|---|
| **标题** | Memory Interoperability Protocol (MIP) |
| **状态** | 草案 (Draft) — MVP |
| **版本** | 0.1.0 |
| **日期** | 2026-02-11 |

---

## 摘要

MIP 定义了一个极简的开放约定：**用户在本地维护一个 JSON 文件（`~/.mip/memory.json`），任何 AI 产品都可以读取它来了解用户。**

就这么简单。

---

## 1. 问题

你在 ChatGPT 上花了半年教它"我是前端工程师、用 React、喜欢简洁回复"。换到 Claude？从零开始。

AI 记忆被平台锁定了。MIP 要把它解锁。

---

## 2. MVP 设计

### 2.1 一个文件解决一切

```
~/.mip/memory.json
```

就一个文件。没有守护进程，没有数据库，没有服务端。任何程序都可以直接读它。

### 2.2 文件结构

```jsonc
{
  "$schema": "https://mip-protocol.org/v0.1/schema.json",
  "version": "0.1.0",

  // 你是谁
  "identity": {
    "name": "张三",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "role": "前端工程师",
    "industry": "互联网",
    "tech_stack": ["React", "TypeScript", "Next.js", "Node.js"]
  },

  // 你希望 AI 怎么回复你
  "preferences": {
    "response_style": "concise",        // concise | detailed | balanced
    "formality": "casual",              // formal | casual | adaptive
    "code_comments_language": "zh-CN",  // 代码注释用什么语言
    "variable_names_language": "en",    // 变量名用什么语言
    "explanation_depth": "intermediate" // beginner | intermediate | expert
  },

  // 自定义键值对，放不进上面两类的都可以放这里
  "custom": {
    "�常用框架": "Next.js App Router",
    "编辑器": "VS Code + Antigravity",
    "关注领域": ["AI 应用开发", "Web3", "产品设计"]
  }
}
```

### 2.3 设计原则

| 原则 | 实现 |
|---|---|
| **零依赖** | 纯 JSON 文件，任何语言 3 行代码就能读 |
| **用户完全控制** | 文件在用户自己的机器上，想改就改 |
| **渐进增强** | 只有 `identity` 和 `preferences` 是标准字段，`custom` 随便扩展 |
| **向后兼容** | 未来的 MIP v0.2 只会新增字段，不会删除/改动已有字段 |

---

## 3. AI 产品如何接入

### 3.1 最简集成 (3 行代码)

**Python:**
```python
import json, pathlib
MIP_PATH = pathlib.Path.home() / ".mip" / "memory.json"
user_memory = json.loads(MIP_PATH.read_text()) if MIP_PATH.exists() else {}
```

**JavaScript/Node.js:**
```javascript
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
const MIP_PATH = `${homedir()}/.mip/memory.json`;
const userMemory = existsSync(MIP_PATH) ? JSON.parse(readFileSync(MIP_PATH, 'utf-8')) : {};
```

### 3.2 注入到 System Prompt

读取后，AI 产品只需将内容拼接到 System Prompt 中：

```
你正在与以下用户对话：
- 姓名：张三
- 职业：前端工程师
- 技术栈：React, TypeScript, Next.js
- 回复风格：简洁直接
- 代码注释：中文
- 变量命名：英文
```

### 3.3 通过 MCP Tool 接入 (推荐)

对于支持 MCP 的 AI 产品，MIP 提供一个标准的 MCP Server，将记忆暴露为 MCP Resource + Tool：

```
MCP Server: mip-server
├── Resource: mip://memory        → 返回完整 memory.json
├── Tool: mip_get_preference      → 查询单个偏好
└── Tool: mip_update_preference   → 更新单个偏好 (可选)
```

> 参见 [mcp-server/](./mcp-server/) 目录获取完整实现。

---

## 4. Schema 定义

完整的 JSON Schema 见 [schemas/memory.schema.json](./schemas/memory.schema.json)。

核心约束：
- `identity` 和 `preferences` 下的键名是**标准化的**（见 Schema）
- `custom` 下的键名是**自由的**，AI 产品按需读取
- 所有字符串值使用 UTF-8 编码
- 文件大小建议不超过 **64KB**（记忆，不是数据库）

---

## 5. 未来演进路线

MVP 有意做减法。以下特性将在后续版本中按需引入：

| 版本 | 新增能力 |
|---|---|
| v0.1 (当前) | 单文件、只读为主、无权限 |
| v0.2 | 行为模式层 (behavioral patterns) |
| v0.3 | 权限模型 (哪些 AI 可以读哪些字段) |
| v0.4 | 本地 Runtime 守护进程 |
| v0.5 | 跨设备加密同步 |
| v1.0 | 完整规范 (参见 [完整愿景](./RFC-0001-MIP-full-vision.md)) |

---

## 6. 参考

- [完整愿景文档](./RFC-0001-MIP-full-vision.md) — MIP 的长期架构设计
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io) — 工具调用互操作协议
- [MIP MCP Server](./mcp-server/) — 概念验证实现

---

> **Start small. Ship fast. Iterate.**
