export {};

declare global {
  interface Window {
    electronAPI: {
      getSheet(
        range: string
      ): Promise<string[][]>;
    };
  }
}