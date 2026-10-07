import type { ParserNode } from "../@types/parsers.js";

export class StructureComparator {
    public static isEquivalent(aTree: ParserNode, bTree: ParserNode) {
        if (aTree.type != bTree.type) return false;

        const length = aTree.children.length;
        if (length != bTree.children.length) return false;
        
        for (let i = 0; i < length; i++) {
            const aChildren = aTree.children[i]
            const bChildren = bTree.children[i]

            if (!aChildren || !bChildren) return false;
            if (!this.isEquivalent(aChildren, bChildren)) return false;
        }

        return true
    }
}