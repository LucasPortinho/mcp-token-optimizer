import type { FormatterRegistry } from "../adapters/registry/FormatterRegistry.js";

export class CodeExpansor {
    private register: FormatterRegistry;

    constructor(register: FormatterRegistry) {
        this.register = register
    }

    async restoreCode(fileName: string, minifiedCode: string): Promise<string> {
        try {
            const formatter = this.register.getFormatter(fileName);
            return await formatter.format(minifiedCode);
        } catch (e) {
            console.error("Error formatting code:", e);
            return minifiedCode;
        }
    }
}