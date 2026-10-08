export interface IGoogleTableData {
    range?: string | null,
    majorDimension?: string | null | undefined,
    values?: (string | number)[][] | null,
  }

export type TContragentsConst = {
  [key: string]: {
        branch: string;
        manager: string;
    }
}

export type DataObject = Record<
  string, 
  string | undefined | number
>;