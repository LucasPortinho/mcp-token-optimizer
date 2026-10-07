import { LanguageRegistry } from "./adapters/registry/LanguageRegistry.js";
import { FormatterRegistry } from "./adapters/registry/FormatterRegistry.js";
import { MetricsRegistry } from "./adapters/registry/MetricsRegistry.js";
import { PrettierAdapter } from "./adapters/base/PrettierAdapter.js";
import { TreeSitterAdapter } from "./adapters/base/TreeSitterAdapter.js";
import { ConfigReader } from "./config/ConfigReader.js";
import { FileFilter } from "./config/FileFilter.js";
import { OptimizationPipeline } from "./rules/pipeline/optimization.js";
import TypeScriptGrammar from 'tree-sitter-typescript';
import JavaGrammar from 'tree-sitter-java';
import PythonGrammar from 'tree-sitter-python';
import { TokenParser } from "./ai/TokenParser.js";
import { TokenCounter } from "./ai/TokenCounter.js";
import { TokenCompactor } from "./ai/FileCompactor.js";
import { ChangesApplicator } from "./ai/ChangesApplier.js";
import { EditApplicator } from "./ai/EditApplicator.js";
import { CodeExpansor } from "./ai/CodeExpansor.js";
import { SnapshotManager } from "./ai/SnapshotManager.js";
import { CommandHistory } from "./ai/CommandHistory.js";

export const BASE_CONFIG_READER = new ConfigReader();
export const BASE_CONFIG = BASE_CONFIG_READER.loadConfig(process.cwd());
export const BASE_FILE_FILTER = new FileFilter(process.cwd(), BASE_CONFIG);

export const BASE_PIPELINE = new OptimizationPipeline();
for (const rule of BASE_CONFIG.rules) {
    BASE_PIPELINE.addRule(rule);
}

export const BASE_LANGUAGE_REGISTRY = new LanguageRegistry();
const tsGrammar = (TypeScriptGrammar as any).typescript ?? TypeScriptGrammar;
const pythonGrammar = (PythonGrammar as any).python ?? PythonGrammar;
const javaGrammar = (JavaGrammar as any).java ?? JavaGrammar;

BASE_LANGUAGE_REGISTRY.register(['.ts', '.js'], new TreeSitterAdapter('typescript', tsGrammar));
BASE_LANGUAGE_REGISTRY.register(['.py'], new TreeSitterAdapter('python', pythonGrammar));
BASE_LANGUAGE_REGISTRY.register(['.java'], new TreeSitterAdapter('java', javaGrammar));

export const BASE_FORMATTER_REGISTRY = new FormatterRegistry();
BASE_FORMATTER_REGISTRY.register(['.ts', '.js'], new PrettierAdapter('typescript'));
BASE_FORMATTER_REGISTRY.register(['.py'], new PrettierAdapter('python'));
BASE_FORMATTER_REGISTRY.register(['.java'], new PrettierAdapter('java'));

export const BASE_PARSER = new TokenParser(BASE_LANGUAGE_REGISTRY);
export const BASE_COUNTER = new TokenCounter(BASE_CONFIG.apiKey ? { apiKey: BASE_CONFIG.apiKey } : undefined);
export const BASE_MODEL = BASE_CONFIG.model ?? { provider: "open-ai", name: "gpt-4o" };
export const BASE_COMPACTOR = new TokenCompactor(BASE_PARSER, BASE_COUNTER, BASE_PIPELINE, BASE_MODEL, BASE_CONFIG.limits);

export const BASE_EXPANSOR = new CodeExpansor(BASE_FORMATTER_REGISTRY);
export const BASE_SNAPSHOT_MANAGER = new SnapshotManager();
export const BASE_COMMAND_HISTORY = new CommandHistory();
export const BASE_EDIT_APPLICATOR = new EditApplicator(BASE_PARSER);

export const BASE_CHANGES_APPLIER = new ChangesApplicator(
    BASE_EDIT_APPLICATOR,
    BASE_EXPANSOR,
    BASE_PARSER,
    BASE_SNAPSHOT_MANAGER,
    BASE_COMMAND_HISTORY
);

export const BASE_METRICS = new MetricsRegistry();