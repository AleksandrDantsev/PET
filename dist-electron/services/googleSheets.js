import { google } from "googleapis";
import path from "node:path";
const SHEET_ID = "1aIsQaIfkH2m6hjXVE9afhnc-KG_vYtoD50rF5Orm3ww";
const CONFIG_ID = 581263708;
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
    const sheet = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.sheetId === Number(id));
    if (!sheet?.properties?.title) {
        throw new Error(`Лист ${id} не найден`);
    }
    const valuesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: sheet.properties.title,
    });
    const values = valuesResponse.data.values ?? [];
    //   const headersConst =
    //     await getHeadersConst();
    const headerRow = 1;
    if (!headerRow) {
        throw new Error(`Не удалось определить строку заголовков`);
    }
    const headers = values[headerRow - 1];
    const rows = values.slice(headerRow);
    return rows.map((row) => Object.fromEntries(headers.map((header, index) => [
        String(header).trim(),
        row[index] ?? "",
    ])));
}
export async function getSheetsGID() {
    const response = await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
    });
    const result = {};
    response.data.sheets?.forEach((sheet) => {
        const title = sheet.properties?.title;
        const sheetId = sheet.properties?.sheetId;
        if (title && sheetId !== undefined) {
            result[title] = sheetId;
        }
    });
    return result;
}
// export async function getHeadersConst() {
//   const values = await getSheetValuesById(
//     CONFIG_ID
//   );
//   if (values.length < 2) {
//     return {};
//   }
//   const data = values
//     .slice(1)
//     .filter(
//       ([key]) =>
//         String(key ?? "").trim() !== ""
//     );
//   return Object.fromEntries(data);
// }
// export async function getManagersBranchList() {
//   const values = await getSheetValuesById(
//     CONFIG_ID
//   );
//   if (values.length < 2) {
//     return {};
//   }
//   return Object.fromEntries(
//     values
//       .slice(1)
//       .filter(
//         (row) =>
//           String(row[2] ?? "").trim() !== ""
//       )
//       .map((row) => [
//         row[2], // колонка C
//         row[3] ?? "", // колонка D
//       ])
//   );
// }
// export async function getContragents() {
//   const values = await getSheetValuesById(
//     CONFIG_ID
//   );
//   if (values.length < 2) {
//     return {};
//   }
//   return Object.fromEntries(
//     values
//       .slice(1)
//       .filter(
//         (row) =>
//           String(row[4] ?? "").trim() !== ""
//       )
//       .map((row) => [
//         row[4], // E
//         {
//           branch: row[5] ?? "", // F
//           manager: row[6] ?? "", // G
//         },
//       ])
//   );
// }
