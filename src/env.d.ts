/// <reference types="vite/client" />

import type { IGoogleTableData } from "./types/TableSheetData";

export {};

declare global {
    interface Window {
        electronAPI: {
            getSheet(
                range: string
            ): Promise<string[][]>;

            getSheetValuesById(
                id: number | string
            ): IGoogleTableData;

            getSheetsGID(): Promise<Record<string, number>>;
        };
    }
}
