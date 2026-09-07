import type { IGoogleTableData } from "./types/TableSheetData.types";

export { };

declare global {
  interface Window {
    electronAPI: {
      getSheet(
        range: string
      ): Promise<string[][]>;

      getSheetValuesById(
        id: number | string
      ): IGoogleTableData;

      getSheetsGID(): Promise<
        Record<string, number>>;

    };
  }
}