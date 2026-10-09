// preload
import { contextBridge, ipcRenderer } from "electron";
interface IGoogleTableData {
    range?: string | null,
    majorDimension?: string | null | undefined,
    values?: (string | number)[][] | null,
  }

contextBridge.exposeInMainWorld("electronAPI", {
    getSheet: (range: string): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheet", range),

    getSheetValuesById: (id: string | number): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheetValuesById", id),

    getSheetsGID: (): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheetsGID"),

    appendToGoogleSheet: (
        sheetId: number | string,
        data: Record<string, string | number>,
        requiredColumn: string,
        spreadsheetId?: string
    ): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:appendToGoogleSheet", sheetId, data, requiredColumn, spreadsheetId),

});