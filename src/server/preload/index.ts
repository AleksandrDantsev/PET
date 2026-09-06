import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getSheet: (range: string) =>
    ipcRenderer.invoke("google:getSheet", range),
});