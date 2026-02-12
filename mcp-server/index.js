import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { z } from "zod";

// ============================================================
// MIP MCP Server — 概念验证
// 将 ~/.mip/memory.json 暴露为 MCP Resource + Tools
// ============================================================

const MIP_DIR = join(homedir(), ".mip");
const MIP_FILE = join(MIP_DIR, "memory.json");

// --- 辅助函数 ---

/**
 * 读取用户 MIP 记忆文件
 * @returns {object} 记忆对象，文件不存在时返回空结构
 */
function readMemory() {
  if (!existsSync(MIP_FILE)) {
    return { version: "0.1.0", identity: {}, preferences: {}, custom: {} };
  }
  return JSON.parse(readFileSync(MIP_FILE, "utf-8"));
}

/**
 * 将记忆格式化为可注入 System Prompt 的文本
 * @param {object} memory - MIP 记忆对象
 * @returns {string} 格式化后的文本
 */
function formatAsSystemPrompt(memory) {
  const lines = ["## 关于此用户 (来自 MIP)"];

  // 身份信息
  if (memory.identity) {
    const id = memory.identity;
    if (id.name) lines.push(`- 姓名: ${id.name}`);
    if (id.role) lines.push(`- 职业: ${id.role}`);
    if (id.industry) lines.push(`- 行业: ${id.industry}`);
    if (id.language) lines.push(`- 语言: ${id.language}`);
    if (id.timezone) lines.push(`- 时区: ${id.timezone}`);
    if (id.tech_stack?.length) lines.push(`- 技术栈: ${id.tech_stack.join(", ")}`);
  }

  // 偏好
  if (memory.preferences) {
    const pref = memory.preferences;
    if (pref.response_style) lines.push(`- 回复风格: ${pref.response_style}`);
    if (pref.formality) lines.push(`- 正式程度: ${pref.formality}`);
    if (pref.explanation_depth) lines.push(`- 解释深度: ${pref.explanation_depth}`);
    if (pref.code_comments_language) lines.push(`- 代码注释语言: ${pref.code_comments_language}`);
    if (pref.variable_names_language) lines.push(`- 变量命名语言: ${pref.variable_names_language}`);
  }

  // 自定义字段
  if (memory.custom && Object.keys(memory.custom).length > 0) {
    for (const [key, value] of Object.entries(memory.custom)) {
      const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
      lines.push(`- ${key}: ${displayValue}`);
    }
  }

  return lines.join("\n");
}

// --- MCP Server 定义 ---

const server = new McpServer({
  name: "mip-server",
  version: "0.1.0",
});

// Resource: 暴露完整的 memory.json
server.resource(
  "user-memory",
  "mip://memory",
  { description: "用户的 MIP 记忆文件 (~/.mip/memory.json)" },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(readMemory(), null, 2),
    }],
  })
);

// Tool: 获取格式化的用户上下文 (最常用)
server.tool(
  "mip_get_context",
  "获取用户的 MIP 记忆，格式化为可注入 System Prompt 的文本",
  {},
  async () => {
    const memory = readMemory();
    const prompt = formatAsSystemPrompt(memory);
    return {
      content: [{ type: "text", text: prompt }],
    };
  }
);

// Tool: 查询单个偏好值
server.tool(
  "mip_get_preference",
  "查询用户的某个具体偏好",
  {
    section: z.enum(["identity", "preferences", "custom"]).describe("查询的记忆分区"),
    key: z.string().describe("要查询的键名"),
  },
  async ({ section, key }) => {
    const memory = readMemory();
    const sectionData = memory[section];
    if (!sectionData || !(key in sectionData)) {
      return {
        content: [{ type: "text", text: `未找到: ${section}.${key}` }],
        isError: true,
      };
    }
    const value = sectionData[key];
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ section, key, value }, null, 2),
      }],
    };
  }
);

// Tool: 更新偏好值 (可选能力)
server.tool(
  "mip_update_preference",
  "更新用户的某个偏好 (需要用户确认)",
  {
    section: z.enum(["identity", "preferences", "custom"]).describe("要更新的记忆分区"),
    key: z.string().describe("要更新的键名"),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).describe("新的值"),
  },
  async ({ section, key, value }) => {
    const memory = readMemory();
    if (!memory[section]) {
      memory[section] = {};
    }
    const oldValue = memory[section][key];
    memory[section][key] = value;
    writeFileSync(MIP_FILE, JSON.stringify(memory, null, 2), "utf-8");
    return {
      content: [{
        type: "text",
        text: `已更新 ${section}.${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(value)}`,
      }],
    };
  }
);

// --- 启动 ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
