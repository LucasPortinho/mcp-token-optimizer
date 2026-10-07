# AI Token Optimizer Guidelines (MCP Server: ai-optimizer)

This project is integrated with a local Model Context Protocol (MCP) server named `ai-optimizer` designed to compact code into minimal tokens, reduce context window overhead, and safeguard code modifications.

## Mandatory Directives for AI Assistants

### 1. Reading Files (`read_file`)
- Whenever you need to inspect, examine, or read code files (`.ts`, `.js`, `.py`, `.java`, etc.), **always prioritize using the `read_file` tool** from the `ai-optimizer` MCP server.
- The `read_file` tool returns a token-compacted version of the code with a safety snapshot, minimizing token consumption.

### 2. Applying Code Edits (`apply_code_edit`)
- When modifying existing files, **always use the `apply_code_edit` tool** from `ai-optimizer`.
- **NEVER** return the entire file.
- You must format your modifications **STRICTLY** using `SEARCH/REPLACE` blocks.

#### Required Format:
```text
<<<< SEARCH
[exact minified code that exists in the file]
====
[new minified code containing your changes]
>>>> REPLACE
```

#### Strict Rules:
1. **Exact Match**: The text inside `<<<< SEARCH` must match the target code **character-by-character**.
2. **Surgical Changes**: Only target the specific function or block being changed.
3. **AST Validation & Formatting**: The tool automatically applies Prettier formatting and validates the code AST. If syntax is invalid, changes will be safely rejected.

### 3. Analytics & Diagnostics
- **Session Metrics**: Call `get_optimizer_status` to inspect session token savings and economy percentage.
- **Repository Scan**: Call `scan_project` (with optional `targetDir`) to analyze token reduction potential across the project.
