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
        data: IGoogleTableData | null
    ): Record<string, string> | null {
        if (!data?.values) return null;

        const columnsData = valuesToColumns(data);

        if (!columnsData) return null;

        const managers = columnsData["МЕНЕДЖЕРЫ"];
        const branches = columnsData["ФИЛИАЛЫ"];

        if (!managers || !branches) return null;

        const normalize = (value: string | number): string =>
            String(value)
                .normalize("NFC")
                .trim()
                .replace(/\s+/g, " ");

        const normalizeKey = (value: string): string =>
            normalize(value)
                .toLocaleLowerCase("ru-RU")
                .replace(/ё/g, "е");

        const result: Record<string, string> = {};
        const seenManagers = new Set<string>();

        managers.forEach((manager, index) => {
            const normalizedManager = normalize(manager as string);

            if (!normalizedManager) return;

            const managerKey = normalizeKey(normalizedManager);

            // Не допускаем логические дубли менеджеров.
            if (seenManagers.has(managerKey)) return;

            const normalizedBranch = normalize((branches[index] ?? "") as string);

            seenManagers.add(managerKey);
            result[normalizedManager] = normalizedBranch;
        });

        return result;
    },

    getConfigContragentsList(
        data: IGoogleTableData | null): Record<string, 
    {
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
        const holding = columnsData["ХОЛДИНГ"];

        if (!clients || !branches || !managers) return null;

        const result: Record<string, {
            branch: string;
            manager: string;
            holding?: string;
        }> = {};

        clients.forEach((client, index) => {
            const normClient = String(client).trim();

            if (normClient === "") return;

            result[normClient] = {
                branch: String(branches[index] ?? ""),
                manager: String(managers[index] ?? ""),
            };
            if (holding) {
                result[normClient].holding = String(holding[index] ?? "")
            }
        });
        console.log(result)
        return result;
    },

    getZnurTypes(
        data: IGoogleTableData | null
    ): Array<string | number | boolean> | null {
        if (!data?.values) return null;

        const columnsData = valuesToColumns(data);
        console.log(columnsData)
        if (!columnsData) {
            return null;
        }

        const columnZnur = columnsData["ТИПЫ ЗНУР"];

        if (!columnZnur) {
            return null;
        }
        return columnZnur;
    }
}



export const {
    getConfigConst,
    getConfigManagersBranchList,
    getConfigContragentsList,
    getZnurTypes,
} = ch;