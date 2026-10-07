# Agent Guidelines (mcp-token-optimizer)

This file provides operational context and directives for AI coding agents (Antigravity, Cursor, Claude Code, Devin, etc.) working on this repository.

---

## 🛠️ Project Overview
**`mcp-token-optimizer`** is an MCP (Model Context Protocol) server and CLI tool designed to reduce token consumption when interacting with LLMs. It minifies source code to compress context windows, performs surgical `SEARCH/REPLACE` edits, and validates syntax and formatting using AST (Tree-sitter) and Prettier.

---

## 💻 Tech Stack & Key Libraries
- **Runtime & Language**: Node.js (ESNext / NodeNext modules) with TypeScript.
- **Protocol**: `@modelcontextprotocol/sdk` (StdioServerTransport).
- **AST Parsing**: `tree-sitter` and grammars (`tree-sitter-typescript`, `tree-sitter-python`, `tree-sitter-java`).
- **Formatting**: `prettier` (automatically resolves project `.prettierrc`).
- **Token Estimation**: `tiktoken` (OpenAI), `@anthropic-ai/sdk` (Claude), `@google/generative-ai` (Gemini).
- **CLI**: `commander`.

---

## ⚡ Verification Commands
- **Compile**: `npm run build` (`tsc`) — must always compile with 0 errors.
- **Start MCP Server**: `npm run start` or `npm run start:mcp`.
- **MCP Inspector**: `npm run inspector` — launches visual web UI for testing tools.

---

## 🚨 Critical MCP stdio Invariants (DO NOT BREAK)
1. **Never use `console.log` or `console.info`**:
   - `process.stdout` is strictly reserved for JSON-RPC messages by `StdioServerTransport`.
   - Any raw text written to `stdout` breaks the JSON-RPC pipe and crashes the client.
   - All logging and error reporting **must** use `console.error` (which safely writes to `stderr`).

2. **Tool-First Interaction**:
   - Prioritize `read_file` for loading code into context.
   - Prioritize `apply_code_edit` with surgical `SEARCH/REPLACE` blocks when applying changes.
