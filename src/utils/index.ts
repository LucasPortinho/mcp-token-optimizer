import { readFileSync } from "fs";
import TypeScriptGrammar from 'tree-sitter-typescript';
import JavaGrammar from 'tree-sitter-java';
import PythonGrammar from 'tree-sitter-python';
import { TreeSitterAdapter } from "../adapters/base/TreeSitterAdapter.js";
import { LanguageRegistry } from "../adapters/registry/LanguageRegistry.js";
import { TokenCompactor } from "../ai/FileCompactor.js";
import { TokenCounter } from "../ai/TokenCounter.js";
import { TokenParser } from "../ai/TokenParser.js";
import { ConfigReader } from "../config/ConfigReader.js";
import { FileFilter } from "../config/FileFilter.js";
import { OptimizationPipeline } from "../rules/pipeline/optimization.js";
import type { FileOptimizationResult, ProjectOptimizationReport } from "../@types/config.js";

export async function execute(targetDir: string = process.cwd()): Promise<ProjectOptimizationReport> {
    const configReader = new ConfigReader();
    const config = configReader.loadConfig(targetDir);

    const fileFilter = new FileFilter(targetDir, config);
    const files = fileFilter.getAllowedFiles();

    const pipeline = new OptimizationPipeline();
    for (const rule of config.rules) {
        pipeline.addRule(rule);
    }

    const registry = new LanguageRegistry();
    const tsGrammar = (TypeScriptGrammar as any).typescript ?? TypeScriptGrammar;
    const pythonGrammar = (PythonGrammar as any).python ?? PythonGrammar;
    const javaGrammar = (JavaGrammar as any).java ?? JavaGrammar;

    registry.register(['.ts', '.js'], new TreeSitterAdapter('typescript', tsGrammar));
    registry.register(['.py'], new TreeSitterAdapter('python', pythonGrammar));
    registry.register(['.java'], new TreeSitterAdapter('java', javaGrammar));

    const parser = new TokenParser(registry);

    const counter = new TokenCounter(config.apiKey ? { apiKey: config.apiKey } : undefined);

    const model = config.model ?? { provider: "open-ai", name: "gpt-4o" };
    const compactor = new TokenCompactor(parser, counter, pipeline, model, config.limits);

    const reports: FileOptimizationResult[] = [];
    let totalOriginalTokens = 0;
    let totalOptimizedTokens = 0;

    for (const filePath of files) {
        try {
            const content = readFileSync(filePath, 'utf-8');
            const report = await compactor.processFile(filePath, content);

            reports.push({
                ...report,
                filePath
            });

            totalOriginalTokens += report.originalTokens;
            totalOptimizedTokens += report.finalTokens;
        } catch (error) {
            console.warn(`Failed to process file: ${filePath}`, error);
        }
    }

    const totalSavedTokens = totalOriginalTokens - totalOptimizedTokens;
    const overallEconomyPercentage = totalOriginalTokens > 0
        ? totalSavedTokens / totalOriginalTokens
        : 0;

    return {
        targetDir,
        totalFilesFound: files.length,
        totalFilesOptimized: reports.filter(r => r.success).length,
        totalOriginalTokens,
        totalOptimizedTokens,
        totalSavedTokens,
        overallEconomyPercentage,
        reports
    };
}