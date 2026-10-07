import type { CodeExpansor } from "../ai/CodeExpansor.js";
import type { TokenCompactor } from "../ai/FileCompactor.js";

export class CodeValidator {
    private compactor: TokenCompactor
    private expansor: CodeExpansor
    
    constructor(compactor: TokenCompactor, expansor: CodeExpansor) {
        this.compactor = compactor
        this.expansor = expansor
    }

    async test(fileName: string, code: string): Promise<boolean> {
        const initialFormattedCode = await this.expansor.restoreCode(fileName, code);

        const report = await this.compactor.processFile(fileName, code);
        if (!report.success) {
            console.error("Failed to generate report");
            return false;
        }

        const expandedCode = await this.expansor.restoreCode(fileName, report.finalCode)
        
        const success = expandedCode === initialFormattedCode

        if (!success) {
            console.error(`Failed to optimize: ${fileName}`);
        }

        return success
    }
}