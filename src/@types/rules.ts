export interface ContextRule {
    languageName: string
}

export interface IOptimizationRule {
    name: string;
    execute(text: string, context: ContextRule): string;
}
