// preload
import type { IGoogleTableData } from "@/types/TableSheetData";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    getSheet: (range: string): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheet", range),

    getSheetValuesById: (id: string | number): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheetValuesById", id),

    getSheetsGID: (): Promise<IGoogleTableData> =>
        ipcRenderer.invoke("google:getSheetsGID"),

});