import { readFileSync } from 'fs';
import type { EditApplicator } from './EditApplicator.js';
import type { CodeExpansor } from './CodeExpansor.js';
import type { TokenParser } from './TokenParser.js';
import type { SnapshotManager } from './SnapshotManager.js';
import type { CommandHistory } from './CommandHistory.js';
import { WriteFileCommand } from './WriteFileCommand.js';
import type { ParserNode } from '../@types/parsers.js';

export class ChangesApplicator {
  constructor(
    private applicator: EditApplicator,
    private expansor: CodeExpansor,
    private parser: TokenParser, 
    private snapshotManager: SnapshotManager,
    private history: CommandHistory
  ) {}

    async applyChanges(
    filePath: string, 
    minifiedCode: string, 
    AIResponse: string
  ): Promise<boolean> {
    
    const actualContent = readFileSync(filePath, 'utf-8');

    if (this.snapshotManager.fileChanged(filePath, actualContent)) {
      console.error("File changed");
      return false;
    }

    try {
      const editedCode = this.applicator.applyEditions(filePath, minifiedCode, AIResponse);

      const newCode = await this.expansor.restoreCode(filePath, editedCode);

      const newTree = this.parser.getAdapter(filePath).parse(newCode);
      
      if (this.syntaxError(newTree)) {
         throw new Error("Syntax error");
      }

      const saveCommand = new WriteFileCommand(filePath, newCode, actualContent);
      this.history.executeCommand(saveCommand);

      return true;

    } catch (error) {
      console.error("Error applying edits:", error);
      return false;
    }
  }

  
  private syntaxError(node: ParserNode): boolean {
    if (node.type === 'ERROR' || node.originalNode?.hasError || (node.originalNode as any)?.isMissing) {
      return true;
    }
    for (const n of node.children) {
      if (this.syntaxError(n)) return true;
    }
    return false;
  }
}