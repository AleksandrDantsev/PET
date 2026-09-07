import type { IGoogleTableData } from "@/types/TableSheetData.types";

const ah = {
    findIndexOfHeaderRow: function (
        data: IGoogleTableData,
        titles: string[]
    ): number | null {
        if (!data?.values) return null;
        const valuesArr = data.values;

        for (let rowIndex = 0; rowIndex < valuesArr.length; rowIndex++) {
            const row = valuesArr[rowIndex];

            let count = 0;

            for (const title of titles) {
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

    getIndexOfColumnByTitle(
        data: IGoogleTableData,
        title: string,
        headerRowIndex: number = 0
    ): number | null {
        if (!data?.values?.length) return null;

        const headers = data.values[headerRowIndex];
        if (!headers) return null;

        const index = headers.findIndex(
            header => String(header).trim().toLowerCase() === title.trim().toLowerCase()
        )
        return index !== -1 ? index : null;
    }
}


export const {
    findIndexOfHeaderRow,
    getIndexOfColumnByTitle,
} = ah;