/// <reference types="vite/client" />

import type { IGoogleTableData } from "./types/TableSheetData";

export {};

declare global {
    interface Window {
        electronAPI: {
            getSheet(
                range: string
            ): Promise<IGoogleTableData>;

            getSheetValuesById(
                id: number | string
            ): Promise<IGoogleTableData>;

            getSheetsGID(): Promise<IGoogleTableData>;

            appendToGoogleSheet(
                sheetId: number | string,
                data: Record<string, string | number>,
                requiredColumn: string,
                spreadsheetId?: string
            ): Promise<IGoogleTableData>;
        };
    }
}
