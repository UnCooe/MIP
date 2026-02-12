# MIP MCP Server

将 `~/.mip/memory.json` 暴露为 MCP 能力，让任何支持 MCP 的 AI 产品自动获得用户记忆。

## 快速开始

```bash
cd mcp-server
npm install
```

## 接入方式

在你的 MCP 客户端配置中添加：

```json
{
  "mcpServers": {
    "mip": {
      "command": "node",
      "args": ["<path-to>/mip-server/index.js"]
    }
  }
}
```

## 提供的能力

| 类型 | 名称 | 描述 |
|---|---|---|
| Resource | `mip://memory` | 完整的 memory.json 内容 |
| Tool | `mip_get_context` | 获取格式化的用户上下文文本，可直接注入 System Prompt |
| Tool | `mip_get_preference` | 查询某个具体偏好值 |
| Tool | `mip_update_preference` | 更新某个偏好值 |

## 前置条件

确保 `~/.mip/memory.json` 文件存在。可以复制示例文件快速开始：

```bash
mkdir -p ~/.mip
cp ../examples/memory.json ~/.mip/memory.json
# 然后编辑 ~/.mip/memory.json，填入你自己的信息
```
