# AI Token Optimizer (`ai-optimizer`)

A lightweight Model Context Protocol (MCP) server and CLI tool designed to reduce token consumption when working with AI coding assistants (Claude, Cursor, Gemini, etc.).

It compacts code into minimal tokens to optimize context windows, applies surgical `SEARCH/REPLACE` edits, and validates AST integrity alongside Prettier formatting.

---

## 🚀 Features

- **Token Compaction (`read_file`)**: Minifies code, strips redundant whitespaces and comments while keeping AST structure intact.
- **Surgical Code Edits (`apply_code_edit`)**: Applies diffs, validates code syntax with Tree-Sitter AST, and formats with Prettier.
- **Session Analytics (`get_optimizer_status`)**: Real-time tracking of original vs. optimized tokens and percentage saved.
- **Project Scanner (`scan_project`)**: Estimates token reduction potential across entire repositories.
- **Multi-language Support**: TypeScript, JavaScript, Python, and Java.

---

## 📦 Installation & Setup

```bash
git clone <your-repo-url>
cd projeto-tokens-ia
npm install
npm run build
```

---

## 🛠️ Usage

### 1. Run via CLI

```bash
# Check optimization metrics for current session
npm run start status

# Start the MCP server directly
npm run start
```

### 2. Configure with your AI Assistant (MCP)

Add the server to your MCP configuration file (e.g. `~/.gemini/config/mcp_config.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ai-optimizer": {
      "command": "npx",
      "args": [
        "tsx",
        "/absolute/path/to/projeto-tokens-ia/src/index.ts",
        "start"
      ]
    }
  }
}
```

### 3. Test with MCP Inspector

```bash
npm run inspector
```

---

## 📜 Available Scripts

- `npm run build`: Compile TypeScript into `dist/`.
- `npm run start`: Run compiled MCP server.
- `npm run dev:mcp`: Run MCP server in development mode using `tsx`.
- `npm run inspector`: Launch the official MCP Inspector web UI.

---

## 📄 License

MIT
