import { app, BrowserWindow, dialog } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./ipc/google.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function getCredentialsPath() {
    return path.join(app.getPath("userData"), "credentials", "service-account.json");
}
async function validateCredentials(content) {
    const credentials = JSON.parse(content);
    if (typeof credentials !== "object" ||
        credentials === null ||
        !("client_email" in credentials) ||
        !("private_key" in credentials) ||
        typeof credentials.client_email !== "string" ||
        typeof credentials.private_key !== "string") {
        throw new Error("Файл не содержит корректные данные сервисного аккаунта Google.");
    }
}
async function ensureGoogleCredentials() {
    const credentialsPath = getCredentialsPath();
    await fs.mkdir(path.dirname(credentialsPath), {
        recursive: true,
    });
    // В dev-режиме копируем существующий ключ проекта,
    // если он ещё не сохранён в userData.
    if (!app.isPackaged) {
        const developmentPath = path.join(process.cwd(), "credentials", "service-account.json");
        try {
            await fs.access(credentialsPath);
        }
        catch {
            try {
                const content = await fs.readFile(developmentPath, "utf8");
                await validateCredentials(content);
                await fs.writeFile(credentialsPath, content, "utf8");
            }
            catch {
                // Если файла нет, ниже предложим выбрать его вручную.
            }
        }
    }
    // Проверяем ранее сохранённый ключ.
    try {
        const content = await fs.readFile(credentialsPath, "utf8");
        await validateCredentials(content);
        return true;
    }
    catch {
        // Файл отсутствует или не прошёл проверку.
    }
    // Предлагаем выбрать файл, пока пользователь не выберет
    // корректный JSON или не отменит настройку.
    while (true) {
        const result = await dialog.showOpenDialog({
            title: "Выберите service-account.json",
            properties: ["openFile"],
            filters: [
                {
                    name: "JSON",
                    extensions: ["json"],
                },
            ],
        });
        if (result.canceled || !result.filePaths[0]) {
            await dialog.showMessageBox({
                type: "warning",
                title: "Настройка не завершена",
                message: "Без ключа сервисного аккаунта Google приложение не сможет загружать таблицы.",
            });
            return false;
        }
        try {
            const content = await fs.readFile(result.filePaths[0], "utf8");
            await validateCredentials(content);
            await fs.writeFile(credentialsPath, content, {
                encoding: "utf8",
                mode: 0o600,
            });
            return true;
        }
        catch (error) {
            await dialog.showMessageBox({
                type: "error",
                title: "Ошибка credentials",
                message: error instanceof Error
                    ? error.message
                    : String(error),
            });
        }
    }
}
function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "../../preload/index.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    win.webContents.openDevTools();
    if (app.isPackaged) {
        win.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
    }
    else {
        win.loadURL("http://localhost:5173");
    }
}
app.whenReady().then(async () => {
    try {
        const credentialsReady = await ensureGoogleCredentials();
        if (!credentialsReady) {
            app.quit();
            return;
        }
        createWindow();
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    }
    catch (error) {
        dialog.showErrorBox("Ошибка запуска приложения", error instanceof Error ? error.message : String(error));
        app.quit();
    }
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
