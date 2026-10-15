import type { IGoogleTableData } from "@/types/TableSheetData";

const dh = {
    dataToObjects: function (
        data: IGoogleTableData,
        positionHeaderRow: number = 0
    ): Record<string, string | number>[] {
        if (!data?.values) return [];

        const headers = data.values[positionHeaderRow];

        if (!headers) return [];

        const headerIndexes = new Map<string, number>();

        headers.forEach((header, index) => {
            const key = String(header).trim();

            if (key === "") return;

            if (headerIndexes.has(key)) {
                console.warn(
                    `[dataToObjects] Повторяющийся заголовок "${key}". ` +
                    `Первый столбец: ${headerIndexes.get(key)}, ` +
                    `повторный столбец: ${index}. Используется первый.`
                );
                return;
            }

            headerIndexes.set(key, index);
        });

        const rows = data.values.slice(positionHeaderRow + 1);

        return rows.map(row =>
            Object.fromEntries(
                Array.from(headerIndexes, ([header, index]) => [
                    header,
                    row[index] ?? "",
                ])
            )
        );
    },

    valuesToColumns(data: IGoogleTableData, positionHeaderRow: number = 0  // { Артикул: ["A1", "A2", "A3"], Цена: [100], Остаток: [5, 10] }
    ): { [k: string]: (string | number | boolean)[] } | null {

        if (!data?.values) return null;
        const headers = data.values[positionHeaderRow];

        if (!headers) return {};

        const rows = data.values.slice(positionHeaderRow + 1);

        return Object.fromEntries(
            headers.map((header, columnIndex) => {
                const column = rows.map(
                    row => row[columnIndex] ?? ""
                );

                while (column.length &&
                    String(column[column.length - 1]).trim() === ""
                ) {
                    column.pop();
                }
                return [
                    String(header).trim(),
                    column
                ];
            })
        );
    },
};

export const {
    dataToObjects,
    valuesToColumns,
} = dh;