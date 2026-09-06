// ipc
import { ipcMain } from "electron";
import { getSheet, getSheetValuesById, getSheetsGID,
// getHeadersConst,
// getManagersBranchList,
// getContragents,
 } from "../services/googleSheets.js";
// после добавления сюда нужно перезапускать electron
ipcMain.handle("google:getSheet", async (_, range) => {
    return getSheet(range);
});
ipcMain.handle("google:getSheetValuesById", async (_, id) => {
    return getSheetValuesById(id);
});
ipcMain.handle("google:getSheetsGID", async () => getSheetsGID());
// ipcMain.handle("google:getHeadersConst",
//   async () => getHeadersConst()
// );
// ipcMain.handle("google:getManagersBranchList",
//   async () => getManagersBranchList()
// );
// ipcMain.handle("google:getContragents",
//   async () => getContragents()
// );
