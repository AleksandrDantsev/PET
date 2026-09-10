import type { IGoogleTableData } from "../../../types/TableSheetData.js";
import { google } from "googleapis";
import path from "node:path";

const SHEET_ID = "1aIsQaIfkH2m6hjXVE9afhnc-KG_vYtoD50rF5Orm3ww";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(
    process.cwd(),
    "credentials",
    "service-account.json"
  ),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});


export async function getSheet(range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return response.data.values ?? [];
}


export async function getSheetValuesById(
  id: number | string
): Promise<IGoogleTableData> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets?.find(
    sheet => sheet.properties?.sheetId === Number(id)
  );

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

  return Object.fromEntries(
    (response.data.sheets ?? []).map(sheet => [
      sheet.properties?.sheetId,
      sheet.properties?.title,
    ])
  );
}