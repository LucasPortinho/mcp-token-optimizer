import type { OptimizationLimits, OptimizationReport } from "../@types/optimization.js";
import type { ContextRule } from "../@types/rules.js";
import type { Model } from "../@types/token-counter.js";
import type { OptimizationPipeline } from "../rules/pipeline/optimization.js";
import { StructureComparator } from "./StructureComparator.js";
import type { TokenCounter } from "./TokenCounter.js";
import type { TokenParser } from "./TokenParser.js";

export class TokenCompactor {
    private parser: TokenParser;
    private counter: TokenCounter;
    private pipeline: OptimizationPipeline;
    private targetModel: Model
    private limits: OptimizationLimits;

    constructor(
        parser: TokenParser, 
        counter: TokenCounter, 
        pipeline: OptimizationPipeline, 
        targetModel: Model,
        limits: OptimizationLimits
    ) {
        this.parser = parser;
        this.counter = counter;
        this.pipeline = pipeline;
        this.targetModel = targetModel;
        this.limits = limits;
    }

    private generateReport(success: boolean, description: string, finalCode: string, originalTokens: number, finalTokens: number, totalEconomy: number): OptimizationReport {
        return {
            success,
            description,
            finalCode,
            finalTokens,
            originalTokens,
            totalEconomy
        }
    }

    async processFile(fileName: string, originalCode: string): Promise<OptimizationReport> {
        // checking if is avaliable
        const originalTokens = await this.counter.count(originalCode, this.targetModel);
        
        if (originalTokens < this.limits.minimumTokensToProcess) {
            return this.generateReport(
                false, 
                "Too small to be processed",
                originalCode,
                originalTokens,
                originalTokens,
                0
            );
        }

        const adapter = this.parser.getAdapter(fileName)
        const originalTree = adapter.parse(originalCode)
        const protectedCode = adapter.findProtectedCode(originalTree)

        // optimizing
        const context: ContextRule = {
            languageName: adapter.languageName
        }
        const optimizedCode = this.pipeline.execute(originalCode, protectedCode, context);

        // securing
        const newTree = adapter.parse(optimizedCode)
        const isValid = StructureComparator.isEquivalent(originalTree, newTree)

        if (!isValid) {
            this.generateReport(
                false, 
                "Failed to generate new code structure",
                originalCode,
                originalTokens,
                originalTokens,
                0
            );
        }

        // final report
        const finalTokens = await this.counter.count(optimizedCode, this.targetModel);
        const totalEconomy = originalTokens - finalTokens
        const economyPercentage = totalEconomy / originalTokens

        if (economyPercentage < this.limits.minimumEconomyPercentage) {
            return this.generateReport(
                false, 
                "Economy too small to be processed",
                originalCode,
                originalTokens,
                originalTokens,
                0
            );
        }

        return this.generateReport(
            true, 
            "New code generated with success",
            optimizedCode,
            originalTokens,
            finalTokens,
            totalEconomy
        );
    }
}