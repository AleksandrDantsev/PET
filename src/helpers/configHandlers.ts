import type { IGoogleTableData } from "../types/TableSheetData"
import { valuesToColumns } from "./dataHandlers";

const ch = {
    getConfigConst(
        data: IGoogleTableData | null
    ): Record<string, string> | null {  // { const: title}
        if (!data?.values || data === null) return null;

        const columnsData = valuesToColumns(data);

        if (!columnsData) return null;

        const constants = columnsData["КОНСТАНТЫ ЗАГОЛОВКОВ"];
        const headers = columnsData["ЗАГОЛОВКИ"];

        if (!constants || !headers) return null;

        const result: Record<string, string> = {};

        constants.forEach((constant, index) => {
            if (String(constant).trim() === "") return;
            result[String(constant)] = String(headers[index] ?? "");
        });

        return result;
    },

    getConfigManagersBranchList(
        data: IGoogleTableData
    ): Record<string, string> | null {
        if (!data?.values) return null;

        const columnsData = valuesToColumns(data);

        if (!columnsData) return null;

        const managers = columnsData["МЕНЕДЖЕРЫ"];
        const branches = columnsData["ФИЛИАЛЫ"];

        if (!managers || !branches) return null;

        const result: Record<string, string> = {};

        managers.forEach((manager, index) => {
            if (String(manager).trim() === "") return;

            result[String(manager).trim()] = String(branches[index] ?? "");
        });

        return result;
    },

    getConfigContragentsList(data: IGoogleTableData): Record<string, {
        branch: string;
        manager: string;
    }> | null {
        if (!data?.values) return null;

        const columnsData = valuesToColumns(data);

        if (!columnsData) {
            return null;
        }

        const clients = columnsData["КЛИЕНТЫ"];
        const branches = columnsData["ФИЛИАЛ"];
        const managers = columnsData["МЕНЕДЖЕРЫ КЛИЕНТОВ"];

        if (!clients || !branches || !managers) return null;

        const result: Record<string, {
            branch: string;
            manager: string;
        }> = {};

        clients.forEach((client, index) => {
            if (String(client).trim() === "") return;

            result[String(client).trim()] = {
                branch: String(branches[index] ?? ""),
                manager: String(managers[index] ?? "")
            };
        });

        return result;
    }
}



export const {
    getConfigConst,
    getConfigManagersBranchList,
    getConfigContragentsList,
} = ch;