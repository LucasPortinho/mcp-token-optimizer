export interface IFormatterAdapter {
  languageName: string;
  format(code: string, filePath?: string): Promise<string>;
}