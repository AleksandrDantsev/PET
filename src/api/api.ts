import type { IGoogleTableData } from "@/types/TableSheetData";

export const api = {
    google: {
        getSheet: (range: string): Promise<IGoogleTableData> =>
            window.electronAPI.getSheet(range),

        getSheetValuesById: (id: string | number): Promise<IGoogleTableData> =>
            window.electronAPI.getSheetValuesById(id),

        getSheetsGID: (): Promise<IGoogleTableData> =>
            window.electronAPI.getSheetsGID(),
    },
};