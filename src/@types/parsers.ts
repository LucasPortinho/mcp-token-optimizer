import type { SyntaxNode } from "tree-sitter";

export interface ParserNode {
    type: string;
    startPosition: number;
    endPosition: number;
    text: string;
    children: ParserNode[];
    originalNode: SyntaxNode;
}

export interface IParserAdapter {
    languageName: string;
    parse(code: string): ParserNode;
    findProtectedCode(tree: ParserNode): ProtectedCode[]
}

export interface ILanguageRegistry {
    register(extensions: string[], adapter: IParserAdapter): void;
    getAdapter(fileName: string): IParserAdapter;
}

export interface ProtectedCode {
    startAt: number;
    endsAt: number;
    type: string; // regex, comments, etc
}
