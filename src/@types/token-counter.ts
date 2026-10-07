import type Anthropic from "@anthropic-ai/sdk";
import type { TiktokenModel } from "tiktoken";

export type CostCounter = {
    newText: string;
    cost: number;
}

export type Model = 
    | { provider: "open-ai"; name: TiktokenModel }
    | { provider: "anthropic"; name: Anthropic.Model }
    | { provider: "gemini"; name: string };

export type ConstructorArgs = {
    apiKey?: string;
}

export type FormattingCost = {
    totalOriginal: number;
    totalClean: number;
    totalEconomy: number;
    details: {
        blankLinesCost: number;
        indentationCost: number;
        breakLinesCost: number;
        extraSpacesCost: number;
    }
}

export type AllTokens = {
    path: string;
    report: FormattingCost;
}

export type ScanRepo = {
    allTokens: AllTokens[];
    finalReport: FormattingCost;
}

export interface TokenCounterInterface  {
    countTokensOpenAI(text: string, model: TiktokenModel): number
    countTokensGemini(text: string, model: string): Promise<number>
    countTokensAnthropic(text: string, model: Anthropic.Model): Promise<number>
    count(text: string, model: Model): Promise<number>
}