export interface SessionSummary {
  uptimeMinutes: number;
  totalReads: number;
  totalEdits: number;
  totalOriginalTokens: number;
  totalSentTokens: number;
  totalSavedTokens: number;
  economyPercentage: number;
  filesProcessed: string[];
}
export class MetricsRegistry {
    private startTime = new Date();
    private totalReads = 0;
    private totalEdits = 0;
    private totalOriginalTokens = 0;
    private totalSentTokens = 0;
    private filesSet = new Set<string>();

    recordRead(filePath: string, originalTokens: number, sentTokens: number) {
        this.totalReads++;
        this.totalOriginalTokens += originalTokens
        this.totalSentTokens += sentTokens
        this.filesSet.add(filePath)
    }

    recordEdit(filePath: string) {
        this.totalEdits++;
        this.filesSet.add(filePath)
    }

    getSummary(): SessionSummary {
        const totalSavedTokens = this.totalOriginalTokens - this.totalSentTokens
        const percentage = this.totalOriginalTokens > 0 ? parseFloat(((totalSavedTokens / this.totalOriginalTokens) * 100).toFixed(2)) : 0;
        const uptimeMs = Date.now() - this.startTime.getTime()

        return {
            uptimeMinutes: Math.round(uptimeMs / 1000 / 60),
            totalReads: this.totalReads,
            totalEdits: this.totalEdits,
            totalOriginalTokens: this.totalOriginalTokens,
            totalSentTokens: this.totalSentTokens,
            totalSavedTokens: Math.max(0, totalSavedTokens),
            economyPercentage: percentage,
            filesProcessed: Array.from(this.filesSet),
        }
    }

}