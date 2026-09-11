// ipc
import { ipcMain } from "electron";
import {
    getSheet,
    getSheetValuesById,
    getSheetsGID,
} from "../services/googleSheets.js";

// после добавления сюда нужно перезапускать electron

ipcMain.handle("google:getSheet",
    async (_, range: string) => {
        return getSheet(range);
    }
);

ipcMain.handle("google:getSheetValuesById",
    async (_, id: string | number) => {
        return getSheetValuesById(id);
    }
);

ipcMain.handle("google:getSheetsGID",
    async () => getSheetsGID()
);