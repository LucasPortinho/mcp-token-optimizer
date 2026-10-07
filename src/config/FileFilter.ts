import type { Ignore } from "ignore";
import type { OptimizerConfig } from "../@types/config.js";
import ignore from "ignore";
import { join, relative } from "path";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";

export class FileFilter {
    private ignore: Ignore;
    private rootDir: string;
    private config: OptimizerConfig;

    constructor (rootDir: string, config: OptimizerConfig) {
        this.rootDir = rootDir
        this.config = config

        this.ignore = ignore()
        this.ignore.add(this.config.ignore)

        const gitignorePath = join(this.rootDir, '.gitignore')
        if (existsSync(gitignorePath)) {
            const contentGitignore = readFileSync(gitignorePath, 'utf-8')
            this.ignore.add(contentGitignore)
        }
    }

    private allowedExtensions(fileName: string) {
        return this.config.allowedExtensions.some(ext => fileName.endsWith(ext))
    }

    getAllowedFiles(): string[] {
        const allowedFiles: string[] = []

        const searchDir = (actualPath: string) => {
            const items = readdirSync(actualPath)

            for (const item of items) {
                const absPath = join(actualPath, item)
                const relativePath = relative(this.rootDir, absPath)

                if (this.ignore.ignores(relativePath)) continue;

                const stat = statSync(absPath)
                if (stat.isDirectory()) {
                    searchDir(absPath)
                }
                else {
                    if (this.allowedExtensions(item)) {
                        allowedFiles.push(absPath)
                    }
                }
            }
        }

        searchDir(this.rootDir)
        return allowedFiles
    }
}