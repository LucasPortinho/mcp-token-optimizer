import type { ContextRule, IOptimizationRule } from "../../@types/rules.js";

export class RemoveIndentation implements IOptimizationRule {
    name = "RemoveIndentation"

    execute(text: string): string {
        return text.replace(/^[ \t]+/gm, '');
    }
}

export class RemoveBlankLines implements IOptimizationRule {
    name = "RemoveBlankLines"

    execute(text: string): string {
        return text.replace(/^\s*[\r\n]/gm, '');
    }
}

export class RemoveBreakLines implements IOptimizationRule {
    name = "RemoveBreakLines"

    execute(text: string): string {
        return text.replace(/[\r\n]+/g, '');
    }
}

export class RemoveExtraSpaces implements IOptimizationRule {
    name = "RemoveExtraSpaces"

    execute(text: string): string {
        return text.replace(/[ \t]{2,}/g, '')
    }
}

export class RemoveEndLineSpaces implements IOptimizationRule {
    name = "RemoveEndLineSpaces"

    execute(text: string): string {
        return text.replace(/[ \t]+$/gm, '')
    }
}
