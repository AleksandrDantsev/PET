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
        data: IGoogleTableData | null,
    ): Record<
        string,
        {
            branch: string;
            manager: string;
            holding?: string;
        }
    > | null {
        if (!data?.values) return null;

        const columnsData = valuesToColumns(data);

        if (!columnsData) return null;

        const clients = columnsData["КЛИЕНТЫ1"];
        const branches = columnsData["ФИЛИАЛ1"];
        const managers = columnsData["МЕНЕДЖЕРЫ КЛИЕНТОВ1"];
        const holding = columnsData["ХОЛДИНГ1"];

        if (!clients || !branches || !managers) return null;

        type Contragent = {
            branch: string;
            manager: string;
            holding?: string;
        };

        const grouped = new Map<string, Contragent[]>();

        clients.forEach((client, index) => {
            const normClient = String(client ?? "").trim();

            if (
                normClient === "" ||
                !branches[index] ||
                !managers[index]
            ) {
                return;
            }

            const entry: Contragent = {
                branch: String(branches[index] ?? ""),
                manager: String(managers[index] ?? ""),
            };

            if (holding) {
                entry.holding = String(holding[index] ?? "").trim();
            }

            const entries = grouped.get(normClient) ?? [];
            entries.push(entry);
            grouped.set(normClient, entries);
        });

        const result: Record<string, Contragent> = {};

        grouped.forEach((entries, client) => {
            if (entries.length === 1) {
                result[client] = entries[0];
                return;
            }

            const uniqueHoldings = new Set(
                entries.map(entry => entry.holding ?? ""),
            );

            if (uniqueHoldings.size > 1) {
                result[client] =
                    entries.find(entry => entry.holding !== client) ??
                    entries[0];
            } else {
                result[client] = entries[0];
            }
        });
        console.log(Object.keys(result).filter(el => el === "Бояринцев Глеб Михайлович ИП"))
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