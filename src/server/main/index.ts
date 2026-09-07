import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./ipc/google.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload",
        "index.js"
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.openDevTools();

  if (app.isPackaged) {
    win.loadFile(
      path.join(
        process.cwd(),
        "dist",
        "index.html"
      )
    );
  } else {
    win.loadURL(
      "http://localhost:5173"
    );
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});