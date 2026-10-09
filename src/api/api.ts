import type { IGoogleTableData } from "@/types/TableSheetData";

export const api = {
    google: {
        getSheet: (range: string): Promise<IGoogleTableData> =>
            window.electronAPI.getSheet(range),

        getSheetValuesById: (id: string | number): Promise<IGoogleTableData> =>
            window.electronAPI.getSheetValuesById(id),

        getSheetsGID: (): Promise<IGoogleTableData> =>
            window.electronAPI.getSheetsGID(),

        appendToGoogleSheet: (
            sheetId: number | string,
            data: Record<string, string | number>,
            requiredColumn: string,
            spreadsheetId?: string
        ): Promise<IGoogleTableData> =>
            window.electronAPI.appendToGoogleSheet(sheetId, data, requiredColumn, spreadsheetId),
    },
};