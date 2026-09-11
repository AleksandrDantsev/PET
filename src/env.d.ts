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
        };
    }
}
