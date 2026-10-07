import { readdir } from "fs/promises";
import type { TokenCompactor } from "./FileCompactor.js";
import { join } from "path";
import { readFileSync } from "fs";
import type { OptimizationReport } from "../@types/optimization.js";

export class BatchCompactor {
    private compactor: TokenCompactor;
    
    constructor(compactor: TokenCompactor) {
        this.compactor = compactor
    }

    async processFolder(path: string) {
        const items = await readdir(path, {
            withFileTypes: true,
            recursive: true
        })
        const reports: OptimizationReport[] = []

        for (const item of items) {
            if (item.isFile()) {
                const filePath = join(item.parentPath, item.name);
                const content = readFileSync(filePath, 'utf-8');

                try {
                    const report = await this.compactor.processFile(filePath, content)
                    
                    if (report.success) {
                        reports.push(report)
                    }
                    else {
                        console.warn(`${filePath}: ${report.description}`)
                    }
                }
                catch (e) {
                    console.error(`Failed to process: ${filePath}`, e);
                }
            }
        }

        return reports;
    } 
}