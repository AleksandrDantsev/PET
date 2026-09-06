/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getSheet: (range) =>
    ipcRenderer.invoke("google:getSheet", range),
});