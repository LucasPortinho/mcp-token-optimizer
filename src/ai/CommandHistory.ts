import type { ICommand } from "../@types/command.js";

export class CommandHistory {
    private history: ICommand[] = [];

    executeCommand(command: ICommand): void {
        command.execute();
        this.history.push(command)
    }

    undoAll(): void {
        while (this.history.length > 0) {
            const command = this.history.pop()
            command?.undo();
        }
    }
}