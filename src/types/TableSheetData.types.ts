export interface IGoogleTableData {
    range?: string | null,
    majorDimension?: string | null | undefined,
    values?: (string | number | boolean)[][] | null,
  }
  