import { check } from "./checkInterchangeablePositions";
const ah = {
    findIndexOfHeaderRow: function (data, titles) {
        if (!data?.values)
            return null;
        const normalize = (value) => String(value).trim().replace(/\s+/g, " ").toLowerCase();
        const normalizedTitles = titles.map(normalize);
        for (let rowIndex = 0; rowIndex < data.values.length; rowIndex++) {
            const row = data.values[rowIndex].map(normalize);
            let count = 0;
            for (const title of normalizedTitles) {
                if (row.includes(title)) {
                    count++;
                }
            }
            if (count >= 4) {
                return rowIndex;
            }
        }
        return null;
    },
    getIndexOfColumnByTitle(data, title, headerRowIndex = 0) {
        if (!data?.values?.length)
            return null;
        const headers = data.values[headerRowIndex];
        if (!headers)
            return null;
        const index = headers.findIndex(header => String(header).trim().toLowerCase() === title.trim().toLowerCase());
        return index !== -1 ? index : null;
    },
    getManagerAndBranchByClient(data, searchedClient) {
        if (!data || !searchedClient)
            return null;
        for (const client in data) {
            if (check.checkContragent(client, searchedClient)) {
                return {
                    manager: (data[client].manager ?? "").trim(),
                    branch: (data[client].branch.trim() ?? "").trim(),
                };
            }
        }
        return null;
    }
};
export const { findIndexOfHeaderRow, getIndexOfColumnByTitle, getManagerAndBranchByClient, } = ah;
