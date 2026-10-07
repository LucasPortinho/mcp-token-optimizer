import { BASE_CONFIG_READER, BASE_METRICS } from "./base.js";
import { CLIInterface } from "./mcp/cli.js";

const cli = new CLIInterface(BASE_CONFIG_READER, BASE_METRICS)
cli.parse(process.argv)