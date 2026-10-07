import { writeFileSync } from "fs";
import type { ICommand } from "../@types/command.js";

export class WriteFileCommand implements ICommand {
    private filePath: string;
    private newContent: string;
    private oldContent: string;

    constructor(filePath: string, newContent: string, oldContent: string) {
        this.filePath = filePath
        this.newContent = newContent
        this.oldContent = oldContent
    }

    execute(): void {
        writeFileSync(this.filePath, this.newContent, 'utf-8')
        console.error(`New content saved at: ${this.filePath}`)
    }

    undo(): void {
        writeFileSync(this.filePath, this.oldContent, 'utf-8')
        console.error(`Content restored at: ${this.filePath}`)
    }
}