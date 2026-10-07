export interface OptimizationLimits {
    minimumTokensToProcess: number; 
    minimumEconomyPercentage: number;
}

export interface OptimizationReport {
    success: boolean;
    description: string;
    finalCode: string
    originalTokens: number;
    finalTokens: number;
    totalEconomy: number;
}
