import { ipcMain } from "electron";
import { getSheet } from "../services/googleSheets.js";
ipcMain.handle("google:getSheet", async (_, range) => {
    return getSheet(range);
});
