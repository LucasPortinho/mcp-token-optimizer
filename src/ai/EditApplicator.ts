import type { IParserAdapter, ParserNode } from "../@types/parsers.js";
import type { TokenParser } from "./TokenParser.js";
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';

export class EditApplicator {
    private parser: TokenParser;

    constructor(parser: TokenParser) {
        this.parser = parser
    }

    private findMainNode(astNode: ParserNode): ParserNode | null {
        for (const node of astNode.children) {
            if (
                node.type === 'function_declaration' ||
                node.type === 'class_declaration' ||
                node.type === 'lexical_declaration' || // const/let
                node.type === 'method_definition'
            ) return node;

            if (node.type === 'export_statement') {
                const inner = this.findMainNode(node);
                if (inner) return inner;
            }
        }
        return null;
    }

    private fallback(targetCode: string, searchBlock: string) {
        console.warn("Using fuzzy search...");

        const dmp = new DiffMatchPatch();
    
        dmp.Match_Threshold = 0.3; 
        
        dmp.Match_Distance = targetCode.length; 
        
        const aproxLocation = 0;

        const start = dmp.match_main(targetCode, searchBlock, aproxLocation);

        if (start === -1) {
            throw new Error("Fuzzy search failed");
        }

        const end = start + searchBlock.length;

        return { start, end };
    }

    private getId(node: ParserNode) {
        const idNode = node.children.find(c => c.type === "identifier")
        return idNode ? idNode.text : null
    }

    private findRelatedNode(mainNode: ParserNode, anchorNode: ParserNode, searchBlock: string): ParserNode | null {
        let result: ParserNode | null = null;
        
        const search = (node: ParserNode) => {
            if (result) return;

            if (node.type === anchorNode.type) {
                const mainId = this.getId(node)
                const anchorId = this.getId(anchorNode)

                if (mainId && anchorId && mainId === anchorId) {
                    result = node;
                    return; 
                }
            }

            for (const n of node.children) {
                search(n);
            }
        }

        search(mainNode);
        return result;
    }   

    private findASTLimits(
        targetCode: string, searchBlock: string, adapter: IParserAdapter
    ): { start: number, end: number } {
        const completeAst = adapter.parse(targetCode)
        const astSnippet = adapter.parse(searchBlock)

        const anchorNode = this.findMainNode(astSnippet)

        if (!anchorNode) return this.fallback(targetCode, searchBlock);

        const newNode = this.findRelatedNode(completeAst, anchorNode, searchBlock)

        if (!newNode) throw new Error("Node not found")

        return {
            start: newNode.startPosition,
            end: newNode.endPosition
        }
    }

    applyEditions(filePath: string, targetCode: string, AIResponse: string): string {
        const regex = /<<<< SEARCH\n([\s\S]*?)\n====\n([\s\S]*?)\n>>>> REPLACE/g;
        
        let newCode = targetCode;
        let match;
        let changes = 0;

        const adapter = this.parser.getAdapter(filePath)

        while ((match = regex.exec(AIResponse)) != null) {
            const searchBlock = match[1]?.trim()
            const replaceBlock = match[2]?.trim()

            const { start, end } = this.findASTLimits(targetCode, searchBlock!, adapter)

            newCode = newCode.substring(0, start) + replaceBlock + newCode.substring(end)

            changes++;
        }

        if (changes === 0) throw new Error("No changes applied");

        return newCode
    }   
}