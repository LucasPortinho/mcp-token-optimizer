# ⚡ mcp-token-optimizer

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol-purple.svg)](https://modelcontextprotocol.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A high-performance **Model Context Protocol (MCP)** server and CLI tool engineered to drastically reduce token consumption when coding with AI assistants (Claude, Cursor, Gemini, Copilot, Windsurf).

It intercepts code sent to LLMs, compacts it to minimal tokens, enforces surgical `SEARCH/REPLACE` diffs, and validates Abstract Syntax Tree (AST) integrity alongside automated Prettier formatting.

---

## 🎯 The Problem & The Solution

- **The Problem**: Sending full, boilerplate-heavy, indented source files to LLMs rapidly exhausts context windows, degrades attention ("lost in the middle" phenomenon), and drives up API costs.
- **The Solution**: `mcp-token-optimizer` minifies source code structurally before delivery to the model, reducing context consumption by **10% to 30%**. When the AI replies with surgical edits, the server restores formatting via **Prettier**, verifies that the **AST is intact** (preventing syntax breakage), and snapshots changes with undo capability.

---

## ✨ Features

- 🗜️ **Token Compaction (`read_file`)**: Strips non-essential indentation, blank lines, and whitespace while strictly safeguarding strings and syntax.
- 🩺 **Surgical Edits with AST Validation (`apply_code_edit`)**: Applies diffs using `<<<< SEARCH ... ==== ... >>>> REPLACE` blocks. Automatically validates syntax via Tree-sitter and formats with Prettier before saving to disk.
- 🛡️ **Snapshot & History Manager**: Keeps historical snapshots of files prior to edits with undo and roll-back capabilities.
- 🔍 **Project Token Scanner (`scan_project`)**: Analyzes whole repositories and reports potential token savings and file-by-file optimization rates.
- 📊 **Real-time Session Analytics (`get_optimizer_status`)**: Monitors read operations, edit count, tokens saved, and economy percentage in real time.
- 🌐 **Multi-Language AST Support**: Built-in Tree-Sitter grammars for **TypeScript**, **JavaScript**, **Python**, and **Java**.

---

## 📁 Project Structure

```text
mcp-token-optimizer/
├── src/
│   ├── @types/          # Type definitions (config, AST parsers, tokens, optimization)
│   ├── adapters/        # Tree-sitter & Prettier adapters, LanguageRegistry
│   ├── ai/              # TokenCompactor, TokenCounter, ChangesApplier, SnapshotManager
│   ├── config/          # ConfigReader (loads token-optimizer.config.json), FileFilter
│   ├── mcp/             # MCP Server (StdioServerTransport) & CLI Interface
│   ├── rules/           # Optimization pipeline and AST masking rules
│   ├── utils/           # Repository scanner engine
│   ├── validators/      # Code validation and verification
│   ├── base.ts          # Dependency injection container
│   └── index.ts         # Main CLI & MCP server entrypoint
├── dist/                # Compiled JavaScript distribution
├── AGENTS.md            # Operational instructions for autonomous AI agents
├── CLAUDE.md            # Guidelines for Claude Code / Claude Desktop
├── GEMINI.md            # Guidelines for Gemini / Antigravity IDE
├── .cursorrules         # Guidelines for Cursor AI
└── package.json
```

---

## 📦 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/LucasPortinho/mcp-token-optimizer.git
cd mcp-token-optimizer

# 2. Install dependencies
npm install

# 3. Build the TypeScript project
npm run build
```

---

## ⚙️ Configuration (`token-optimizer.config.json`)

You can customize the optimizer by creating a `token-optimizer.config.json` file in the root of your project:

```json
{
  "allowedExtensions": [".ts", ".js", ".py", ".java", ".go", ".cs"],
  "ignore": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next"
  ],
  "limits": {
    "minimumEconomyPercentage": 0.05,
    "minimumTokensToProcess": 50
  },
  "model": {
    "provider": "open-ai",
    "name": "gpt-4o"
  },
  "apiKey": "your-api-key-here",
  "apiKeyPath": "./.secrets/api-key.txt"
}
```

### Configuration Options:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowedExtensions` | `string[]` | `['.ts', '.js', '.py', '.go', '.java', '.cs']` | File extensions allowed for compaction and scanning. |
| `ignore` | `string[]` | `['node_modules', '.git', 'dist', 'build', 'coverage']` | Folders and paths excluded from scans and processing. |
| `limits.minimumEconomyPercentage` | `number` | `0.05` (5%) | Minimum expected savings ratio required to justify minification. |
| `limits.minimumTokensToProcess` | `number` | `50` | Files smaller than this token threshold are served as-is to prevent overhead. |
| `model.provider` | `string` | `"open-ai"` | Token counting provider: `"open-ai"`, `"anthropic"`, or `"gemini"`. |
| `model.name` | `string` | `"gpt-4o"` | Specific model name for tokenizer calculations. |
| `apiKey` | `string` | `undefined` | Optional direct API key for token counting services. |
| `apiKeyPath` | `string` | `undefined` | Relative or absolute path to a file containing the API key. |

### 🔑 API Key Auto-Discovery
If not specified in `token-optimizer.config.json`, the optimizer automatically detects API keys from your environment variables:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

### 🎨 Prettier Integration
The optimizer includes full automatic Prettier integration. When an AI applies edits through `apply_code_edit`:
1. It looks for local Prettier configuration (`.prettierrc`, `.prettierrc.json`, `prettier.config.js`, or `package.json`).
2. If found, it respects the user's project formatting rules.
3. If not found, it applies clean default formatting (semicolons, 2-space indentation, double quotes, 80 print width).

---

## 🔌 Connecting to AI Assistants (MCP Setup)

### 1. Claude Desktop (`claude_desktop_config.json`)

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-optimizer": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/mcp-token-optimizer/dist/index.js",
        "start"
      ]
    }
  }
}
```

### 2. Antigravity / Gemini IDE (`~/.gemini/config/mcp_config.json`)

```json
{
  "mcpServers": {
    "ai-optimizer": {
      "command": "npx",
      "args": [
        "tsx",
        "/ABSOLUTE/PATH/TO/mcp-token-optimizer/src/index.ts",
        "start"
      ]
    }
  }
}
```

### 3. Cursor & Windsurf

Add the directives from `.cursorrules` to your project's `.cursorrules` or `.windsurfrules`. The AI assistant will automatically prioritize the `read_file` and `apply_code_edit` tools.

---

## 🛠️ CLI Usage

```bash
# Start the MCP server directly
npm run start
# or: node dist/index.js start

# Inspect session metrics & token economy
npm run start status
# or: node dist/index.js status
```

### Output Example (`status`):
```text
┌─────────────────────┬────────┐
│ (index)             │ Values │
├─────────────────────┼────────┤
│ uptimeMinutes       │ 12     │
│ totalReads          │ 18     │
│ totalEdits          │ 5      │
│ totalOriginalTokens │ 14200  │
│ totalSentTokens     │ 11950  │
│ totalSavedTokens    │ 2250   │
│ economyPercentage   │ 15.8%  │
│ filesProcessed      │ 12     │
└─────────────────────┴────────┘
```

---

## 🧪 Testing with MCP Inspector

Test tools interactively via the official visual MCP Inspector:

```bash
npm run inspector
```

This launches a local web UI where you can invoke tools (`read_file`, `scan_project`, `get_optimizer_status`, `apply_code_edit`) and inspect JSON-RPC messages and outputs.

---

## 📜 Available Scripts

- `npm run build`: Compiles TypeScript into `dist/`.
- `npm run start`: Runs compiled MCP server.
- `npm run dev:mcp`: Runs MCP server in development mode using `tsx`.
- `npm run inspector`: Launches MCP Inspector web interface.

---

## 📄 License

This project is licensed under the **ISC License**.
