import type { IGoogleTableData } from "@/types/TableSheetData.types";

const dh = {
    dataToObjects: function (data: IGoogleTableData)
        : Record<string, string | number | boolean>[] | null {
        if (!data?.values) return null;
        const [headers, ...rows] = data.values;

        if (!headers) {
            return [];
        }

        return rows.map(row =>
            Object.fromEntries(
            headers.map((header, index) => [
                String(header).trim(),
                row[index] ?? "",
            ])
            )
        );
    },

    valuesToColumns(data: IGoogleTableData
    ): { [k: string]: (string | number | boolean)[] } | null {
        if (!data?.values) return null;

        const [headers, ...rows] = data.values;

        if (!headers) return {};

        return Object.fromEntries(
            headers.map((header, columnIndex) => {
                const column = rows.map(
                    row => row[columnIndex] ?? ""
                );
                while (column.length && String(column[column.length - 1]).trim() === "") {
                    column.pop();
                }
                return [
                    String(header).trim(),
                    column
                ];
            })
        );
    }

    // getIndexRowByConfigConst: function

    // getIndexColumnByName: function(data: IGoogleTableData): number | null {

    // }


};

export const {dataToObjects, valuesToColumns} = dh;