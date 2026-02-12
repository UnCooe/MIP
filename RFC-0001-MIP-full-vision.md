# RFC-0001: MIP — Memory Interoperability Protocol

| 字段 | 值 |
|---|---|
| **标题** | Memory Interoperability Protocol (MIP) |
| **作者** | Dome 团队 |
| **状态** | 草案 (Draft) |
| **创建日期** | 2026-02-11 |
| **版本** | 0.1.0 |

---

## 摘要

MIP (Memory Interoperability Protocol) 定义了一套**AI 记忆的可移植性开放标准**。它允许用户将与 AI 交互中产生的偏好、行为画像、上下文记忆等数据，以结构化格式存储在**用户本地设备**上，并在不同 AI 产品之间无缝共享。

MIP 之于 AI 记忆，正如 MCP 之于 AI 工具调用 — 一个让生态互通的基础设施层。

---

## 1. 动机与问题陈述

### 1.1 问题

当前 AI 产品的记忆能力存在三个根本性缺陷：

1. **平台锁定 (Vendor Lock-in)** — 用户在 ChatGPT 上积累的对话历史、偏好设定和行为画像，无法迁移到 Gemini、Claude 或任何其他 AI 产品。用户的"AI 记忆"成为平台的私有资产。

2. **记忆断裂 (Memory Fragmentation)** — 用户同时使用多个 AI 产品时，每个产品各自维护独立的、不完整的用户理解。没有一个 AI 能完整地了解用户。

3. **数据主权丧失 (Loss of Data Sovereignty)** — 用户的行为数据和偏好存储在厂商的云端服务器上，用户无法审查、编辑、删除或导出这些数据。

### 1.2 核心洞察

回顾互联网发展史，**成功的标准都是关于"可移植性"的**：

| 标准 | 解锁了什么 |
|---|---|
| HTTP | 文档的可访问性 |
| SMTP | 邮件的可移植性 |
| OAuth | 身份的可委托性 |
| MCP | 工具调用的互操作性 |
| **MIP** | **AI 记忆的可移植性** |

AI 记忆是**用户数据的新边疆**。如同密码管理器将密码的控制权从浏览器手中夺回交给用户，MIP 的目标是将 AI 记忆的控制权从平台手中夺回交给用户。

---

## 2. 设计目标

### 2.1 核心原则

| 原则 | 描述 |
|---|---|
| **用户主权 (User Sovereignty)** | 记忆数据存储在用户本地，用户拥有完全的读写删权限 |
| **隐私优先 (Privacy-First)** | 默认不共享任何数据，AI 产品需要显式申请权限 |
| **渐进采纳 (Progressive Adoption)** | AI 产品可以仅实现 MIP 的子集即可获益 |
| **语义互操作 (Semantic Interop)** | 不同 AI 产品写入的记忆可以被其他产品理解 |
| **最小侵入 (Minimal Intrusion)** | 与现有 AI 产品架构兼容，无需大规模改造 |

### 2.2 非目标

- MIP **不是**一个聊天记录同步工具（它存储的是结构化记忆，不是原始对话）
- MIP **不是**一个用户身份系统（它不处理认证和授权，但可以与 OAuth 等标准配合）
- MIP **不是**一个向量数据库标准（它定义的是上层语义协议，不限定底层存储实现）

---

## 3. 架构概览

```
┌────────────────────────────────────────────────────────────┐
│                    AI 产品 (MIP Client)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ ChatGPT  │  │  Gemini  │  │  Claude  │  │  本地模型   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │              │               │        │
│       └──────────────┴──────┬───────┴───────────────┘        │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  MIP Runtime    │                       │
│                    │  (本地守护进程)  │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│            ┌────────────────┼────────────────┐               │
│            │                │                │               │
│     ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼─────┐        │
│     │ 权限管理器   │ │ 记忆存储引擎 │ │  同步引擎   │        │
│     │ (Gatekeeper)│ │  (Store)    │ │ (Sync Hub)  │        │
│     └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                              │
│                    ~/.mip/ (用户本地)                         │
└────────────────────────────────────────────────────────────┘
```

### 3.1 组件说明

| 组件 | 职责 |
|---|---|
| **MIP Client** | AI 产品中嵌入的 SDK/插件，通过 MIP API 读写用户记忆 |
| **MIP Runtime** | 运行在用户本地的守护进程，负责权限校验、存储读写和同步 |
| **Gatekeeper** | 权限管理器，基于分级权限模型控制哪些 Client 可以访问哪些记忆 |
| **Store** | 记忆存储引擎，管理本地 `~/.mip/` 目录下的结构化数据 |
| **Sync Hub** | 可选的跨设备同步引擎，支持端到端加密的去中心化同步 |

---

## 4. 记忆模型 (Memory Model)

MIP 将 AI 记忆分为四个**语义层 (Semantic Layer)**，从稳定到易变排列：

### 4.1 四层记忆架构

```
┌─────────────────────────────────────────┐
│  Layer 4: Ephemeral Context (临时上下文)    │  ← 分钟级，当前任务相关
│  TTL: 会话级  │  例: "用户正在写一篇论文"   │
├─────────────────────────────────────────┤
│  Layer 3: Behavioral Patterns (行为模式)   │  ← 周/月级，使用习惯
│  TTL: 90天    │  例: "用户偏好先写大纲再展开"│
├─────────────────────────────────────────┤
│  Layer 2: Preferences (偏好设定)           │  ← 年级，风格偏好
│  TTL: 365天   │  例: "用户喜欢简洁直接的回复"│
├─────────────────────────────────────────┤
│  Layer 1: Identity (身份画像)              │  ← 稳定，基础属性
│  TTL: 无限    │  例: "前端工程师, 使用 React" │
└─────────────────────────────────────────┘
```

### 4.2 记忆条目 (Memory Entry) 核心 Schema

每条记忆使用以下 JSON Schema 表达：

```jsonc
{
  // === 元数据 ===
  "id": "mem_a1b2c3d4",                          // 唯一标识符
  "version": 3,                                   // 乐观并发控制版本号
  "created_at": "2026-01-15T08:30:00Z",           // 创建时间
  "updated_at": "2026-02-11T16:00:00Z",           // 最后更新时间
  "expires_at": "2026-05-11T16:00:00Z",           // 过期时间 (null = 永不过期)
  
  // === 来源追踪 ===
  "source": {
    "client_id": "com.openai.chatgpt",            // 写入此记忆的 MIP Client
    "conversation_id": "conv_xyz789",             // 可选：关联的对话 ID
    "confidence": 0.85                            // 置信度 (0.0 ~ 1.0)
  },
  
  // === 语义内容 ===
  "layer": "preferences",                         // 所属层级: identity | preferences | behavioral | ephemeral
  "namespace": "communication.style",             // 命名空间 (点号分隔的层级路径)
  "key": "response_verbosity",                    // 记忆键
  "value": "concise",                             // 记忆值 (string | number | boolean | object)
  "description": "用户偏好简洁直接的回复风格，避免冗长的解释", // 人类可读的描述
  
  // === 语义标签 ===
  "tags": ["communication", "style", "preference"],
  
  // === 权限 ===
  "acl": {
    "read": ["*"],                                // 所有 Client 可读
    "write": ["com.openai.chatgpt"],              // 仅创建者可写
    "admin": ["user"]                             // 仅用户可删除/修改权限
  }
}
```

### 4.3 预定义命名空间 (Namespace Registry)

MIP 定义一组标准命名空间，确保不同 AI 产品写入的记忆在语义上可互操作：

| 命名空间 | 描述 | 示例键 |
|---|---|---|
| `identity.personal` | 基础个人信息 | `name`, `language`, `timezone` |
| `identity.professional` | 职业信息 | `role`, `industry`, `tech_stack` |
| `preferences.communication` | 沟通风格偏好 | `verbosity`, `formality`, `language_style` |
| `preferences.content` | 内容偏好 | `code_style`, `explanation_depth`, `example_preference` |
| `behavioral.workflow` | 工作流模式 | `planning_style`, `iteration_preference` |
| `behavioral.interaction` | 交互模式 | `feedback_style`, `correction_behavior` |
| `context.current_project` | 当前项目上下文 | `project_name`, `tech_stack`, `goals` |
| `context.current_task` | 当前任务上下文 | `task_description`, `blockers`, `progress` |

> [!NOTE]
> AI 产品也可以使用自定义命名空间 (以 `x-` 前缀开头，如 `x-chatgpt.plugins`)，但这些命名空间的语义互操作性不做保证。

---

## 5. 传输协议 (Transport Protocol)

### 5.1 通信方式

MIP Client 与 MIP Runtime 之间通过**本地 HTTP API** 通信（类似 MCP 的 stdio/SSE 传输层）：

```
MIP Runtime 监听: http://localhost:3179 (MIP 的 ASCII 码 sum)
```

### 5.2 核心 API

#### 5.2.1 读取记忆

```http
GET /v1/memory?namespace=preferences.communication&key=verbosity
Authorization: Bearer <client_token>
```

```json
{
  "entries": [
    {
      "id": "mem_a1b2c3d4",
      "namespace": "preferences.communication",
      "key": "response_verbosity",
      "value": "concise",
      "confidence": 0.85,
      "updated_at": "2026-02-11T16:00:00Z"
    }
  ]
}
```

#### 5.2.2 写入/更新记忆

```http
PUT /v1/memory
Authorization: Bearer <client_token>
Content-Type: application/json

{
  "layer": "preferences",
  "namespace": "preferences.communication",
  "key": "response_verbosity",
  "value": "concise",
  "confidence": 0.85,
  "description": "用户偏好简洁直接的回复风格"
}
```

#### 5.2.3 批量查询 (上下文注入)

AI 产品在会话开始时，可以一次性拉取所有相关记忆：

```http
POST /v1/memory/context
Authorization: Bearer <client_token>
Content-Type: application/json

{
  "layers": ["identity", "preferences"],
  "max_entries": 50,
  "format": "system_prompt"
}
```

返回可直接注入 System Prompt 的格式化文本：

```json
{
  "system_prompt_fragment": "## 关于此用户\n- 姓名: ...\n- 职业: 前端工程师\n- 技术栈: React, TypeScript, Next.js\n- 沟通偏好: 简洁直接，避免冗长解释\n- 代码风格: 偏好函数式，使用 ESLint strict 配置\n",
  "token_count": 128,
  "entry_count": 12
}
```

#### 5.2.4 记忆回收 (Decay)

```http
POST /v1/memory/decay
Authorization: Bearer <runtime_admin_token>

{
  "strategy": "confidence_weighted_ttl",
  "dry_run": true
}
```

---

## 6. 权限模型 (Permission Model)

### 6.1 分级权限

借鉴移动端权限模型，MIP 采用**显式授权 + 最小权限原则**：

```
┌─────────────────────────────────────────────────────┐
│                    权限层级                           │
│                                                      │
│  Level 0: NONE        无权限 (默认)                   │
│  Level 1: READ_BASIC  读取 identity + preferences    │
│  Level 2: READ_FULL   读取所有层级                    │
│  Level 3: WRITE       读取 + 写入 (需要命名空间白名单) │
│  Level 4: ADMIN       完全控制 (仅限用户本人/可信工具) │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 6.2 授权流程

```
用户首次使用某 AI 产品时:

┌──────────┐     注册请求      ┌──────────────┐
│ AI 产品   │ ──────────────→ │  MIP Runtime  │
│ (Client) │                  │              │
└──────────┘                  └──────┬───────┘
                                     │
                              弹出授权对话框
                                     │
                              ┌──────▼───────┐
                              │   用户授权    │
                              │  "允许 Claude │
                              │   读取偏好?"  │
                              └──────┬───────┘
                                     │
                              颁发 Client Token
                                     │
                              ┌──────▼───────┐
                              │  Client 凭证  │
                              │  存储在本地    │
                              └──────────────┘
```

### 6.3 审计日志

所有记忆访问都记录在 `~/.mip/audit.log` 中：

```jsonc
{
  "timestamp": "2026-02-11T16:05:00Z",
  "client_id": "com.openai.chatgpt",
  "action": "read",
  "namespace": "preferences.communication",
  "entries_accessed": 3,
  "permitted": true
}
```

---

## 7. 本地存储布局

```
~/.mip/
├── config.toml                   # 全局配置
├── keys/                         # 加密密钥
│   ├── master.key                # 主密钥 (用户密码派生)
│   └── sync.pub                  # 同步用公钥
├── clients/                      # 已注册的 MIP Client
│   ├── com.openai.chatgpt.toml   
│   ├── com.google.gemini.toml    
│   └── com.anthropic.claude.toml 
├── memory/                       # 记忆存储
│   ├── identity/                 # Layer 1
│   │   ├── personal.json
│   │   └── professional.json
│   ├── preferences/              # Layer 2
│   │   ├── communication.json
│   │   └── content.json
│   ├── behavioral/               # Layer 3
│   │   └── workflow.json
│   └── ephemeral/                # Layer 4
│       └── current_session.json
├── audit.log                     # 访问审计日志
└── sync/                         # 同步状态
    └── crdt_state.bin            # CRDT 同步状态
```

---

## 8. 记忆衰减策略 (Decay Strategy)

人类记忆会遗忘，AI 记忆也应该。MIP 定义了三种衰减机制：

### 8.1 基于 TTL 的自然衰减

每一层有默认 TTL，超时后自动降低置信度或删除：

| 层级 | 默认 TTL | 衰减行为 |
|---|---|---|
| Identity | ∞ | 不衰减 |
| Preferences | 365 天 | 置信度 -0.1/月，低于 0.3 时标记待确认 |
| Behavioral | 90 天 | 置信度 -0.2/月，低于 0.3 时删除 |
| Ephemeral | 会话级 | 会话结束后 24 小时删除 |

### 8.2 基于置信度的合并

当多个来源写入同一记忆键时，采用**置信度加权合并**：

```
最终值 = argmax(value_i, weight = confidence_i × recency_factor_i)
```

### 8.3 用户主动管理

用户可以通过 MIP Dashboard（本地 Web UI）随时：
- 查看所有记忆条目
- 编辑或删除任何条目
- 冻结某条记忆（防止 AI 产品修改）
- 导出/导入全部记忆

---

## 9. 跨设备同步 (可选)

### 9.1 设计约束

- **端到端加密** — 同步服务器无法解密记忆内容
- **去中心化优先** — 支持 P2P 直接同步，云端中继为备选
- **冲突解决** — 使用 CRDT (Conflict-free Replicated Data Types) 确保最终一致性

### 9.2 同步方案优先级

1. **局域网直连** — 同一 WiFi 下的设备自动发现并同步
2. **P2P 穿透** — 基于 WebRTC/STUN 的点对点同步
3. **加密中继** — 用户自建或使用可信第三方的加密中继服务器

---

## 10. 与现有技术的关系

| 技术/标准 | 关系 |
|---|---|
| **MCP** | 互补。MCP 定义 AI 如何调用工具，MIP 定义 AI 如何记住用户。两者可以通过 MCP Tool 暴露 MIP 能力 |
| **OAuth 2.0** | MIP 的权限模型可以复用 OAuth 的授权码流程 |
| **WebAuthn** | MIP Runtime 的用户认证可以使用 WebAuthn |
| **Solid (Tim Berners-Lee)** | 理念相似（用户数据主权），但 Solid 更通用，MIP 专注 AI 记忆场景 |
| **Mem0** | Mem0 是一个实现，MIP 是一个规范。Mem0 可以成为 MIP 的一个兼容实现 |
| **GGUF / ONNX** | 这些是模型格式标准，MIP 是数据标准，不同层面 |

---

## 11. 渐进式采纳路径

MIP 设计为可渐进采纳，AI 产品无需一次性实现全部规范：

### Level 0: 只读消费者

```
AI 产品只需实现 GET /v1/memory/context
即可在会话开始时注入用户偏好到 System Prompt
工作量: ~50 行代码
```

### Level 1: 基础读写

```
实现 GET + PUT，可以读取和更新基础偏好
工作量: ~200 行代码
```

### Level 2: 完整集成

```
实现全部 API，包括命名空间管理、权限协商、批量操作
工作量: ~1000 行代码
```

### Level 3: 生态贡献

```
为 Namespace Registry 贡献新的标准命名空间
参与 MIP 规范的评审和演进
```

---

## 12. 安全考量

### 12.1 威胁模型

| 威胁 | 缓解措施 |
|---|---|
| 恶意 AI 产品窃取全部记忆 | 分级权限 + 显式用户授权 + 命名空间白名单 |
| AI 产品写入虚假记忆 | 来源追踪 + 置信度机制 + 用户审核 |
| 本地文件被恶意软件读取 | 主密钥加密 + OS 级文件权限 |
| 同步过程中的中间人攻击 | 端到端加密 + 证书钉扎 |
| 记忆推断攻击 (通过查询模式推断隐私) | 审计日志 + 速率限制 + 异常检测 |

### 12.2 隐私等级

用户可以为每条记忆设置隐私等级：

- **Public** — 所有已授权 Client 可见
- **Restricted** — 仅指定 Client 可见
- **Sealed** — 仅用户通过 Dashboard 可见，AI 产品完全不可访问

---

## 13. 未来方向

1. **联邦记忆 (Federated Memory)** — 家庭/团队级别的共享记忆层（如"团队技术栈偏好"）
2. **记忆市场 (Memory Marketplace)** — 用户可以选择性地匿名贡献记忆数据用于 AI 训练，并获得收益
3. **记忆推理 (Memory Reasoning)** — MIP Runtime 内置轻量推理引擎，自动从低层记忆推导高层理解
4. **与 Agent 框架集成** — 作为 AI Agent 的持久化记忆层（如 LangGraph、AutoGen 等）
5. **MIP-over-MCP** — 将 MIP 能力封装为 MCP Tool，让任何支持 MCP 的 AI 自动获得记忆能力

---

## 14. 参考

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io) — Anthropic 提出的工具调用互操作协议
- [Solid Project](https://solidproject.org) — Tim Berners-Lee 的去中心化数据主权项目
- [Mem0](https://mem0.ai) — AI 记忆层实现
- [CRDTs](https://crdt.tech) — 无冲突复制数据类型
- [WebAuthn](https://webauthn.io) — Web 认证标准

---

> **本文档为草案 (Draft)，欢迎社区评审和贡献。**
>
> 许可证: CC-BY-SA 4.0
