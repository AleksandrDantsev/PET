import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
    getSheet: (range) => ipcRenderer.invoke("google:getSheet", range),
});
