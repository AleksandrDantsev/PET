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
