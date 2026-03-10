# MIP：Memory Interoperability Protocol

<p align="center">
  <strong>一个用户拥有、可移植、任何 AI 工具都能读取的 <code>memory.json</code> 标准。</strong>
</p>

<p align="center">
  简体中文 | <a href="./README.md">English</a>
</p>

<p align="center">
  <img src="./assets/mip-poster-zh.png" alt="MIP poster" width="760" />
</p>
---

## 为什么会有 MIP

AI 工具越来越会“记住你”。

但这些记忆通常被锁在各自的平台里。

你在 ChatGPT 里教会它你的偏好，切到 Claude 或本地 Agent，又要重新开始。过几个月再切回来，旧平台记住的还可能是一个过时版本的你。

MIP 想解决的，就是这层可移植性问题：

> 在本地维护一个 `~/.mip/memory.json`。任何 AI 工具都可以读取它来了解你。

没有守护进程，没有托管服务，没有数据库。

就一个文件。

## MIP 是什么

MIP v0.1 是一个面向“显式用户记忆”的极简标准：

- identity
- preferences
- custom 自定义字段

它刻意保持很小。v0.1 的目标不是一次性解决所有记忆问题，而是先提供一个足够稳定、足够简单、足够容易被工具采纳的可移植基线。

## MIP 不是什么

- 不是 Mem0、Letta 这种记忆产品
- 不是托管式的资料同步服务
- 不是 `.cursorrules` 或 `CLAUDE.md` 这类工具私有规则文件的替代品

那些是实现，或者是单一工具的约定；MIP 想做的是共享格式。

## 示例

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
    "code_comments_language": "zh-CN",
    "variable_names_language": "en"
  },
  "custom": {
    "编辑器": "VS Code",
    "关注领域": ["AI", "Web3", "Design"]
  }
}
```

## 3 行代码读取

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

## 它为什么有意义

- 用户拥有：记忆在你的机器上，不只存在于某一家平台
- 可移植：多个 AI 工具可以读取同一份用户画像
- 成本低：接入门槛非常低
- 可演进：以后可以在不破坏 v0.1 的前提下扩展更丰富的记忆层

可以把它理解成：AI 时代的 `.editorconfig`。

## 最可能的采纳路径

最容易支持 MIP 的工具通常是：

1. IDE Agent 和本地代码工具
2. 开源 AI 客户端
3. 支持 MCP 的应用
4. 本地模型运行时和包装器

因为这些工具本来就运行在你的机器上，读取本地文件的成本接近于零。

## MIP 和 MCP 的关系

MCP 和 MIP 解决的是两类问题：

- MCP 回答的是：AI 能调用什么工具？
- MIP 回答的是：AI 在和谁协作？

MIP 不依赖 MCP 也能工作。对于支持 MCP 的应用，MIP 也可以通过仓库里提供的概念验证 server 暴露出去，见 [mcp-server/](./mcp-server/)。

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

## 仓库内容

- [RFC-0001-MIP.md](./RFC-0001-MIP.md)：MVP 规范
- [RFC-0001-MIP-full-vision.md](./RFC-0001-MIP-full-vision.md)：长期愿景
- [schemas/memory.schema.json](./schemas/memory.schema.json)：JSON Schema
- [examples/memory.json](./examples/memory.json)：示例文件
- [mcp-server/](./mcp-server/)：MCP 概念验证

## 路线图

| 版本 | 重点 |
|---|---|
| **v0.1** | 单文件、显式用户记忆、以读为主 |
| v0.2 | behavioral patterns 层 |
| v0.3 | 权限与可见性控制 |
| v0.4 | 本地 runtime daemon |
| v0.5 | 加密的跨设备同步 |
| v1.0 | 完整规范 |

## 贡献方式

MIP 现在还很早。当前最有价值的贡献是：

- 在 AI 工具里加入 read support
- 审阅 RFC 和 schema
- 为 MCP 客户端做适配
- 直接挑战这个模型，提出边界条件和反例

如果你想讨论采纳路径、字段语义或实现细节，欢迎提 [issue](https://github.com/UnCooe/MIP/issues)。

## License

[CC-BY-SA 4.0](./LICENSE)

