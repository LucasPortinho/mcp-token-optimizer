import type { IFormatterAdapter } from "../../@types/formatter.js";

export class FormatterRegistry {
    private formatters = new Map<string, IFormatterAdapter>()

    register(extensions: string[], formatter: IFormatterAdapter) {
        for (const ext of extensions) {
            this.formatters.set(ext.toLowerCase().trim(), formatter)
        }
    }

    getFormatter(fileName: string) {
        const match = fileName.match(/\.[0-9a-z]+$/i);
        const ext = match ? match[0].toLowerCase() : '';
        const formatter = this.formatters.get(ext)

        if (!formatter) throw new Error("Formatter not found")

        return formatter
    }
}