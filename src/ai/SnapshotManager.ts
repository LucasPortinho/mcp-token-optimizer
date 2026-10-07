import { createHash } from "crypto"

export class SnapshotManager {
    private snapshots = new Map<string, string>()

    private generateHash(text: string): string {
        return createHash("sha256").update(text).digest("hex")
    }

    register(filePath: string, originalContent: string) {
        this.snapshots.set(filePath, this.generateHash(originalContent))
    }

    fileChanged(filePath: string, currentContent: string): boolean {
        const currentSnapshot = this.snapshots.get(filePath)
        if (!currentSnapshot) return true
        
        return currentSnapshot != this.generateHash(currentContent)
    }
}