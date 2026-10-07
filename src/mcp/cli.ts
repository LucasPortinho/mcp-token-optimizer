import { Command } from "commander";
import type { ConfigReader } from "../config/ConfigReader.js";
import { MetricsRegistry } from "../adapters/registry/MetricsRegistry.js";
import { AgentMCPServer } from "./server.js";
import { BASE_COMPACTOR, BASE_CHANGES_APPLIER, BASE_METRICS, BASE_CONFIG_READER } from "../base.js";

export class CLIInterface {
    private program: Command;
    private configReader: ConfigReader;
    private metrics: MetricsRegistry;

    private configCommands() {
        this.program
            .command("start")
            .description("Start the MCP Server")
            .action(async () => {
                const mcpServer = new AgentMCPServer(BASE_COMPACTOR, BASE_CHANGES_APPLIER, this.metrics);
                await mcpServer.start();
            });

        this.program
            .command("status")
            .description("Show your economy during MCP usage")
            .action(() => {
                const config = this.configReader.loadConfig(process.cwd())
                const stats = this.metrics.getSummary()
                console.table(stats)
            })
    }

    constructor(configReader: ConfigReader = BASE_CONFIG_READER, metrics: MetricsRegistry = BASE_METRICS) {
        this.configReader = configReader;
        this.metrics = metrics;

        this.program = new Command();
        this.program
            .name("token-opt")
            .description("Token optimizer for developers")
            .version("1.0.0");

        this.configCommands();
    }

    parse(argv: string[] = process.argv) {
        this.program.parse(argv);
    }
}