import { isAbsolute, join } from "path";
import type { OptimizerConfig } from "../@types/config.js";
import { RemoveBlankLines, RemoveBreakLines, RemoveEndLineSpaces, RemoveExtraSpaces, RemoveIndentation } from "../rules/base/optimization.js";
import { existsSync, readFileSync } from "fs";

export class ConfigReader {
    private defaultConfig: OptimizerConfig = {
        allowedExtensions: ['.ts', '.js', '.py', '.go', '.java', '.cs'],
        ignore: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        rules: [
            new RemoveIndentation(), 
            new RemoveExtraSpaces(),
            new RemoveBlankLines(),
            new RemoveBreakLines(),
            new RemoveEndLineSpaces()
        ],
        limits: {
            minimumEconomyPercentage: 0.05,
            minimumTokensToProcess: 50
        },
    }

    private resolveApiKey(rootDir: string, userConfig?: Partial<OptimizerConfig>): string | undefined {
        if (userConfig?.apiKey) return userConfig.apiKey;

        if (userConfig?.apiKeyPath) {
            const resolvedPath = isAbsolute(userConfig.apiKeyPath) 
                ? userConfig.apiKeyPath 
                : join(rootDir, userConfig.apiKeyPath);

            if (existsSync(resolvedPath)) {
                return readFileSync(resolvedPath, 'utf-8').trim();
            }
        }

        return (
            process.env.OPENAI_API_KEY ||
            process.env.GEMINI_API_KEY ||
            process.env.ANTHROPIC_API_KEY ||
            undefined
        );
    }

    loadConfig(rootDir: string): OptimizerConfig {
        const configPath = join(rootDir, "token-optimizer.config.json");
        
        if (!existsSync(configPath)) {
            return {
                ...this.defaultConfig,
                apiKey: this.resolveApiKey(rootDir)
            };
        }

        try {
            const userConfigRaw = readFileSync(configPath, 'utf-8');
            const userConfig = JSON.parse(userConfigRaw) as Partial<OptimizerConfig>;

            const resolvedApiKey = this.resolveApiKey(rootDir, userConfig);

            return {
                ...this.defaultConfig,
                ...userConfig,
                apiKey: resolvedApiKey,
                ignore: [...this.defaultConfig.ignore, ...(userConfig.ignore || [])],
                allowedExtensions: userConfig.allowedExtensions || this.defaultConfig.allowedExtensions,
                limits: {
                    ...this.defaultConfig.limits,
                    ...(userConfig.limits || {})
                },
                model: userConfig.model || this.defaultConfig.model
            };
        } catch (e) {
            return {
                ...this.defaultConfig,
                apiKey: this.resolveApiKey(rootDir)
            };
        }
    }
}