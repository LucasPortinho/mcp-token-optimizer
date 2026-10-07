import { encoding_for_model, type TiktokenModel } from 'tiktoken'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import type { ConstructorArgs, Model, TokenCounterInterface } from '../@types/token-counter.js';

export class TokenCounter implements TokenCounterInterface {
    private apiKey?: string;

    constructor(args?: ConstructorArgs) {
        if (args?.apiKey) {
            this.apiKey = args.apiKey
        }
    }

    async count(text: string, model: Model): Promise<number> {
        switch (model.provider) {
            case "open-ai":
                return this.countTokensOpenAI(text, model.name);
            case "anthropic":
                return await this.countTokensAnthropic(text, model.name);
            case "gemini":
                return await this.countTokensGemini(text, model.name);
            default:
                throw new Error("Provider not supported");
        }
    }
    
    countTokensOpenAI(text: string, model: TiktokenModel): number {
        const encoder = encoding_for_model(model)
        const tokens = encoder.encode(text)

        encoder.free()
        return tokens.length
    }

    async countTokensGemini(text: string, model: string): Promise<number> {
        if (!this.apiKey) throw new Error("Provide an api key")
        
        const genAI = new GoogleGenerativeAI(this.apiKey)
        const aiModel = genAI.getGenerativeModel({ model })

        const response = await aiModel.countTokens(text)
        return response.totalTokens
    }

    async countTokensAnthropic(text: string, model: Anthropic.Model): Promise<number> {
        if (!this.apiKey) throw new Error("Provide an api key")
        
        const client = new Anthropic({
            apiKey: this.apiKey
        })

        try {
            const response = await client.messages.countTokens({
                model,
                messages: [
                    { role: "user", content: text }
                ]
            })

            return response.input_tokens
        }
        catch (e) {
            console.error("Error:", e);
            return -1;
        }
    }
}
