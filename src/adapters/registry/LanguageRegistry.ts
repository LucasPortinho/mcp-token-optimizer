import type { ILanguageRegistry, IParserAdapter } from "../../@types/parsers.js";

export class LanguageRegistry implements ILanguageRegistry {
    private adapters = new Map<string, IParserAdapter>();
    
    register(extensions: string[], adapter: IParserAdapter): void {
        for (const ext of extensions) {
            this.adapters.set(ext, adapter)
        }
    }

    getAdapter(fileName: string): IParserAdapter {
        const match = fileName.match(/\.[0-9a-z]+$/i);
        const ext = match ? match[0].toLowerCase() : '';

        const adapter = this.adapters.get(ext)
        if (!adapter) throw new Error("Adapter not found");
        
        return adapter
    }
}