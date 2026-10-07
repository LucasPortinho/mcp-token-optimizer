import type { OptimizationLimits, OptimizationReport } from "./optimization.js";
import type { IOptimizationRule } from "./rules.js";
import type { Model } from "./token-counter.js";

export interface OptimizerConfig {
    allowedExtensions: string[];
    ignore: string[];
    rules: IOptimizationRule[];
    limits: OptimizationLimits;
    model?: Model | undefined;
    apiKey?: string | undefined;
    apiKeyPath?: string | undefined;
}

export interface FileOptimizationResult extends OptimizationReport {
    filePath: string;
}

export interface ProjectOptimizationReport {
    targetDir: string;
    totalFilesFound: number;
    totalFilesOptimized: number;
    totalOriginalTokens: number;
    totalOptimizedTokens: number;
    totalSavedTokens: number;
    overallEconomyPercentage: number;
    reports: FileOptimizationResult[];
}
