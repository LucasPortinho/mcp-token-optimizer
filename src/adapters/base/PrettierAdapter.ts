import * as prettier from "prettier";
import type { IFormatterAdapter } from "../../@types/formatter.js";

const DEFAULT_OPTIONS: prettier.Options = {
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
    printWidth: 80,
};

const LANGUAGE_PARSER_MAP: Record<string, string> = {
    javascript: "babel",
    js: "babel",
    jsx: "babel",
    typescript: "typescript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    json5: "json5",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    markdown: "markdown",
    md: "markdown",
    yaml: "yaml",
    yml: "yaml",
};

export class PrettierAdapter implements IFormatterAdapter {
    languageName: string;

    constructor(languageName: string = "typescript") {
        this.languageName = languageName;
    }

    private getParser(): string | null {
        const lang = this.languageName.trim().toLowerCase();
        return LANGUAGE_PARSER_MAP[lang] ?? null;
    }

    async format(code: string, filePath?: string): Promise<string> {
        try {
            const userConfig = await prettier.resolveConfig(filePath || process.cwd());
            if (userConfig) return await prettier.format(code, userConfig);

            const parser = this.getParser();
            if (!parser) return code;

            return await prettier.format(code, {
                ...DEFAULT_OPTIONS,
                parser
            });
        } catch {
            return code;
        }
    }
}