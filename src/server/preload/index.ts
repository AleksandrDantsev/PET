// preload
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getSheet: (range: string) =>
    ipcRenderer.invoke("google:getSheet", range),

  getSheetValuesById: (id: string | number) =>
    ipcRenderer.invoke("google:getSheetValuesById", id),

  getSheetsGID: () =>
    ipcRenderer.invoke("google:getSheetsGID"),


});