import Parser from "tree-sitter";
import type { IParserAdapter, ParserNode, ProtectedCode } from "../../@types/parsers.js";
import { Query, type SyntaxNode } from "tree-sitter";

export class TreeSitterAdapter implements IParserAdapter {
    private parser: Parser;
    private queryString: string;
    private query: Query | null;

    public languageName: string;

    // module it's the LanguageTreeAdapter
    constructor(languageName: string, module: any, queryString: string = '') {
        this.parser = new Parser();
        this.languageName = languageName;
        this.queryString = queryString;
        
        if (this.queryString) {
            this.query = new Query(module, this.queryString)
        }
        else {
            this.query = null
        }
        

        this.parser.setLanguage(module)
    }

    private mapNode(node: SyntaxNode): ParserNode {
        return {
            type: node.type,
            startPosition: node.startIndex,
            endPosition: node.endIndex,
            text: node.text,
            originalNode: node,
            children: node.children.map(node => this.mapNode(node))
        }
    } 

    parse(code: string): ParserNode {
        const tree = this.parser.parse(code)
        return this.mapNode(tree.rootNode)
    }

    findProtectedCode(tree: ParserNode): ProtectedCode[] {
        if (!this.query || !tree.originalNode) return [];

        const matches = this.query.matches(tree.originalNode)
        const protectedCode: ProtectedCode[] = []

        for (const match of matches) {
            for (const capture of match.captures) {
                protectedCode.push({
                    type: capture.name,
                    startAt: capture.node.startIndex,
                    endsAt: capture.node.endIndex
                })
            }
        }

        return protectedCode.sort((a, b) => a.startAt - b.startAt)
    }
}