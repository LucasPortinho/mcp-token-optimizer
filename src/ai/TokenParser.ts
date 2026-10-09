import type { ParserNode, ProtectedCode } from "../@types/parsers.js";
import type { LanguageRegistry } from "../adapters/registry/LanguageRegistry.js";
import { StructureComparator } from "./StructureComparator.js";

export class TokenParser {
    private register: LanguageRegistry;

    constructor(register: LanguageRegistry) {
        this.register = register;
    }

    private optimize(code: string, protectedCode: ProtectedCode[]): string {
        // i will apply the regex here avoiding and skipping protected code
        return code;
    }

    processFile(fileName: string, content: string): ParserNode {
        const adapter = this.register.getAdapter(fileName)
        const tree = adapter.parse(content)
        return tree
    }

    optimizeFile(fileName: string, content: string): string {
        const adapter = this.register.getAdapter(fileName)
        
        const originalTree = adapter.parse(content)
        const protectedCode = adapter.findProtectedCode(originalTree)
        
        const optimizedContent = this.optimize(content, protectedCode);

        // Validate structural equivalence
        const optimizedTree = adapter.parse(optimizedContent);
        const isValid = StructureComparator.isEquivalent(originalTree, optimizedTree);

        if (!isValid) {
            console.error("Optimization cancelled: structural mismatch");
            return content;
        }

        return optimizedContent;
    } 

    getAdapter(fileName: string) {
        return this.register.getAdapter(fileName)
    }
}
