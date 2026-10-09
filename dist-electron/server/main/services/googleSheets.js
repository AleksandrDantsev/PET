import { google } from "googleapis";
import path from "node:path";
const SHEET_ID = "1aIsQaIfkH2m6hjXVE9afhnc-KG_vYtoD50rF5Orm3ww";
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "credentials", "service-account.json"),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
    ],
});
const sheets = google.sheets({
    version: "v4",
    auth,
});
export async function getSheet(range) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range,
    });
    return response.data.values ?? [];
}
export async function getSheetValuesById(id) {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
    });
    const sheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.sheetId === Number(id));
    if (!sheet?.properties?.title) {
        throw new Error(`Лист ${id} не найден`);
    }
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: sheet.properties.title,
    });
    return response.data;
}
export async function getSheetsGID() {
    const response = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
    });
    return Object.fromEntries((response.data.sheets ?? []).map(sheet => [
        sheet.properties?.sheetId,
        sheet.properties?.title,
    ]));
}
export async function appendToGoogleSheet(sheetId, data, requiredColumn, spreadsheetId = SHEET_ID) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(sheet => sheet.properties?.sheetId === Number(sheetId));
    const sheetName = sheet?.properties?.title;
    if (!sheetName || !sheet) {
        throw new Error(`Лист ${sheetId} не найден`);
    }
    const escapedSheetName = `'${sheetName.replace(/'/g, "''")}'`;
    const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${escapedSheetName}!1:1`,
    });
    const headers = headerResponse.data.values?.[0] ?? [];
    if (!headers.length) {
        throw new Error(`В листе "${sheetName}" нет заголовков`);
    }
    const requiredColumnIndex = headers.indexOf(requiredColumn);
    if (requiredColumnIndex === -1) {
        throw new Error(`Не найдена обязательная колонка "${requiredColumn}"`);
    }
    const missingColumns = Object.keys(data).filter(key => !headers.includes(key));
    if (missingColumns.length) {
        throw new Error(`Не найдены столбцы: ${missingColumns.join(", ")}`);
    }
    const requiredColumnLetter = getColumnLetter(requiredColumnIndex + 1);
    const columnResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${escapedSheetName}!${requiredColumnLetter}2:${requiredColumnLetter}`,
    });
    const values = columnResponse.data.values ?? [];
    let targetRow = 2;
    for (let index = values.length - 1; index >= 0; index--) {
        const value = values[index]?.[0];
        if (value !== undefined && String(value).trim() !== "") {
            targetRow = index + 3;
            break;
        }
    }
    const currentRowCount = sheet.properties?.gridProperties?.rowCount ?? 0;
    if (targetRow > currentRowCount) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        appendDimension: {
                            sheetId: Number(sheetId),
                            dimension: "ROWS",
                            length: targetRow - currentRowCount + 1,
                        },
                    },
                ],
            },
        });
    }
    const row = headers.map(header => Object.prototype.hasOwnProperty.call(data, header)
        ? data[header]
        : null);
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${escapedSheetName}!A${targetRow}:${getColumnLetter(headers.length)}${targetRow}`,
        valueInputOption: "RAW",
        requestBody: {
            values: [row],
        },
    });
}
function getColumnLetter(column) {
    let result = "";
    while (column > 0) {
        const remainder = (column - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        column = Math.floor((column - 1) / 26);
    }
    return result;
}
