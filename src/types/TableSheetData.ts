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

export interface SearchFormValue {
    nomenclature: string;
    contragentNames: {
        contragent: string;
        holding: string;
    };
    manager: string | null;
    branch: string | null;
    date: string;
    znurType: string | null;
    contract: string;
    quantity: string;
    dateOfDelivery: string;
}