export {};

declare global {
  interface Window {
    electronAPI: {
      getSheet(
        range: string
      ): Promise<string[][]>;

      getSheetValuesById(
        id: number | string
      ): Promise<string[][]>;

      getSheetsGID(): Promise<
        Record<string, number>>;

      getHeadersConst(): Promise<
        Record<string, number>>;

      getManagersBranchList(): Promise<
        Record<string, number>>;

      getContragents(): Promise<
        Record<string, number>>;



    };
  }
}