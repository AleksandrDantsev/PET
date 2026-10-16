
import { afterEach, describe, expect, it, vi } from "vitest";
import { dataToObjects } from "../dataHandlers";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("dataToObjects", () => {
    const createData = (
        values: (string | number | boolean)[][]
    ): IGoogleTableData => ({
        values,
    }) as IGoogleTableData;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("преобразует строки таблицы в массив объектов", () => {
        const data = createData([
            ["Артикул", "Цена", "Остаток"],
            ["A1", 100, 5],
            ["A2", 200, 10],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Артикул: "A1", Цена: 100, Остаток: 5 },
            { Артикул: "A2", Цена: 200, Остаток: 10 },
        ]);
    });

    it("возвращает пустой массив, если values отсутствует", () => {
        expect(dataToObjects({} as IGoogleTableData)).toEqual([]);
    });

    it("возвращает пустой массив, если values пустой", () => {
        expect(dataToObjects(createData([]))).toEqual([]);
    });

    it("возвращает пустой массив, если строка заголовков отсутствует", () => {
        const data = createData([
            ["Артикул", "Цена"],
        ]);

        expect(dataToObjects(data, 5)).toEqual([]);
    });

    it("использует указанную строку заголовков", () => {
        const data = createData([
            ["Отчёт"],
            ["Дата", "16.10.2026"],
            ["Артикул", "Цена"],
            ["A1", 100],
            ["A2", 200],
        ]);

        expect(dataToObjects(data, 2)).toEqual([
            { Артикул: "A1", Цена: 100 },
            { Артикул: "A2", Цена: 200 },
        ]);
    });

    it("обрезает пробелы в заголовках", () => {
        const data = createData([
            [" Артикул ", " Цена "],
            ["A1", 100],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Артикул: "A1", Цена: 100 },
        ]);
    });

    it("игнорирует пустые заголовки", () => {
        const data = createData([
            ["Артикул", "", "Цена", "   "],
            ["A1", "лишнее", 100, "лишнее"],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Артикул: "A1", Цена: 100 },
        ]);
    });

    it("использует первый столбец при повторяющихся заголовках", () => {
        const warnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        const data = createData([
            ["Цена", "Артикул", "Цена"],
            [100, "A1", 999],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Цена: 100, Артикул: "A1" },
        ]);

        expect(warnSpy).toHaveBeenCalledWith(
            '[dataToObjects] Повторяющийся заголовок "Цена". ' +
            "Первый столбец: 0, повторный столбец: 2. Используется первый."
        );
    });

    it("заполняет отсутствующие значения пустыми строками", () => {
        const data = createData([
            ["Артикул", "Цена", "Остаток"],
            ["A1", 100],
            ["A2"],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Артикул: "A1", Цена: 100, Остаток: "" },
            { Артикул: "A2", Цена: "", Остаток: "" },
        ]);
    });

    it("сохраняет нули и логические значения", () => {
        const data = createData([
            ["Количество", "Активен"],
            [0, true],
            [5, false],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Количество: 0, Активен: true },
            { Количество: 5, Активен: false },
        ]);
    });

    it("возвращает пустые объекты для строк без значений", () => {
        const data = createData([
            ["", "  "],
            ["A1", 100],
        ]);

        expect(dataToObjects(data)).toEqual([
            {},
        ]);
    });

    it("сохраняет пустые строки данных", () => {
        const data = createData([
            ["Артикул", "Цена"],
            [],
            ["A1", 100],
        ]);

        expect(dataToObjects(data)).toEqual([
            { Артикул: "", Цена: "" },
            { Артикул: "A1", Цена: 100 },
        ]);
    });

    it("возвращает пустой массив, если после заголовков нет строк данных", () => {
        const data = createData([
            ["Артикул", "Цена"],
        ]);

        expect(dataToObjects(data)).toEqual([]);
    });
});
