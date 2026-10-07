import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { TokenCompactor } from "../ai/FileCompactor.js";
import type { MetricsRegistry } from "../adapters/registry/MetricsRegistry.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { execute } from "../utils/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ChangesApplicator } from "../ai/ChangesApplier.js";

export class AgentMCPServer {
    private server: Server;
    private compactor: TokenCompactor;
    private changes: ChangesApplicator;
    private metrics: MetricsRegistry;

    private configRoutes() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "read_file",
                    description: "Read a file and return it's version optimized in tokens, with a safety snapshot",
                    inputSchema: {
                        type: "object",
                        properties: {
                            filePath: { type: "string" },
                        },
                        required: ["filePath"]
                    }
                },
                {
                    name: "apply_code_edit",
                    description: "Apply editions in code. Formatting with Prettier and validate the code with AST",
                    inputSchema: {
                        type: "object",
                        properties: {
                            filePath: { type: "string" },
                            code: { type: "string", description: "Minified code" },
                            AIResponse: { type: "string", description: "Text with <<<< SEARCH ... ==== ... >>>> REPLACE blocks" },
                            required: ["filePath", "code", "AIResponse"]
                        }
                    }
                },
                {
                    name: "scan_project",
                    description: "Scans the entire project and returns token optimization statistics for all files.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            targetDir: { type: "string" },
                        }   
                    }
                },
                {
                    name: "get_optimizer_status",
                    description: "Return the session metrics.",
                    inputSchema: { type: "object", properties: {} },
                }
            ]
        }))

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params as any;
            const filePath: string = args?.filePath;

            if (name === "read_file") {
                if (!existsSync(filePath)) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `File not found: ${filePath}` }]
                    };
                }

                const content = readFileSync(filePath, 'utf-8');
                const report = await this.compactor.processFile(filePath, content);
                this.metrics.recordRead(filePath, report.originalTokens, report.finalTokens);

                return {
                    content: [{ type: "text", text: report.finalCode }]
                };
            }

            if (name === "apply_code_edit") {
                const success = await this.changes.applyChanges(filePath, args.code, args.AIResponse);

                if (success) {
                    this.metrics.recordEdit(filePath);
                    return {
                        content: [{ type: "text", text: "Changes successfully applied." }]
                    };
                }

                return {
                    isError: true,
                    content: [{ type: "text", text: "Failed to apply changes. Check syntax or search block." }]
                };
            }

            if (name === "scan_project") {
                const dir = String(args?.targetDir || process.cwd());
                const report = await execute(dir);

                return {
                    content: [{
                        type: "text",
                        text: `Files: ${report.totalFilesFound}\nFiles optimized: ${report.totalFilesOptimized}\nEconomy: ${report.totalSavedTokens} tokens (${(report.overallEconomyPercentage * 100).toFixed(1)}%)`
                    }]
                };
            }

            if (name === "get_optimizer_status") {
                const summary = this.metrics.getSummary();
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(summary, null, 2)
                    }]
                };
            }

            throw new Error(`Tool not found: ${name}`);
        });
    }

    constructor(compactor: TokenCompactor, changes: ChangesApplicator, metrics: MetricsRegistry) {
        this.compactor = compactor;
        this.changes = changes
        this.metrics = metrics

        this.server = new Server(
            { name: "token-optimizer", version: "1.0.0" },
            { capabilities: { tools: {} } }
        )

        this.configRoutes()
    }

    async start() {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
        } catch (error) {
            console.error("Failed to connect to MCP transport:", error);
            throw error;
        }
    }
}