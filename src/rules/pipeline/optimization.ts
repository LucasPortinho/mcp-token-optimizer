import type { ProtectedCode } from "../../@types/parsers.js";
import type { ContextRule, IOptimizationRule } from "../../@types/rules.js";

export class OptimizationPipeline {
    private rules: IOptimizationRule[] = [];

    private maskCode(code: string, protectedCode: ProtectedCode[]) {
        let maskedCode = code;
        const masksMap = new Map<string, string>()

        // reverse protected areas, because replace in the end doesn't break the indexes
        const reverseProtectedCode = protectedCode.sort((a, b) => b.startAt - a.startAt)

        let counter = 0;
        for (const code_ of reverseProtectedCode) {
            const maskToken = `___PROTECTED_${counter}___`
            const originalCode = maskedCode.substring(code_.endsAt, code_.startAt)

            // saving the original code
            masksMap.set(maskToken, originalCode)

            maskedCode = maskedCode.substring(0, code_.startAt) + maskToken + maskedCode.substring(code_.endsAt)
        }

        return { maskedCode, masksMap }
    }

    private unmaskCode(code: string, masksMap: Map<string, string>): string {
        let finalCode = code;

        for (const [token, originalCode] of masksMap.entries()) {
            finalCode = finalCode.replace(token, originalCode)
        }

        return finalCode
    }

    addRule(rule: IOptimizationRule): OptimizationPipeline {
        this.rules.push(rule)
        return this
    }

    execute(originalCode: string, protectedCode: ProtectedCode[], context: ContextRule): string {
        const { maskedCode, masksMap } = this.maskCode(originalCode, protectedCode)

        let processedCode = maskedCode;
        for (const rule of this.rules) {
            processedCode = rule.execute(processedCode, context)
        }

        return this.unmaskCode(processedCode, masksMap)
    }
}