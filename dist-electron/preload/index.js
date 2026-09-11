"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    getSheet: (range) => electron_1.ipcRenderer.invoke("google:getSheet", range),
    getSheetValuesById: (id) => electron_1.ipcRenderer.invoke("google:getSheetValuesById", id),
    getSheetsGID: () => electron_1.ipcRenderer.invoke("google:getSheetsGID"),
});
