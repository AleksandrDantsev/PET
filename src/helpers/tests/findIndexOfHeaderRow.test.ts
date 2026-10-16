
import { describe, expect, it } from "vitest";
import { findIndexOfHeaderRow } from "../auxiliaryTableFuncs";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("findIndexOfHeaderRow", () => {
    const titles = [
        "Номенклатура",
        "Клиент",
        "Менеджер",
        "Филиал",
        "Стоимость",
    ];

    const createData = (
        values: (string | number)[][]
    ): IGoogleTableData => ({
        values,
    }) as IGoogleTableData;

    it("находит заголовки в первой строке", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
            ["Товар 1", "Клиент 1", "Иванов", "Симферополь"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("находит заголовки после нескольких строк данных", () => {
        const data = createData([
            ["Отчёт за неделю"],
            ["Дата", "16.10.2026"],
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
            ["Товар 1", "Клиент 1", "Иванов", "Симферополь"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(2);
    });

    it("возвращает первый индекс, если подходят несколько строк", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
            ["Номенклатура", "Клиент", "Менеджер", "Стоимость"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("возвращает null, если найдено меньше четырёх заголовков", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBeNull();
    });

    it("возвращает null, если заголовки отсутствуют", () => {
        const data = createData([
            ["Товар 1", "Клиент 1", "Иванов", "Симферополь"],
            ["Товар 2", "Клиент 2", "Петров", "Ялта"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBeNull();
    });

    it("возвращает null, если values пустой массив", () => {
        const data = createData([]);

        expect(findIndexOfHeaderRow(data, titles)).toBeNull();
    });

    it("возвращает null, если values отсутствует", () => {
        expect(
            findIndexOfHeaderRow({} as IGoogleTableData, titles)
        ).toBeNull();
    });

    it("находит строку при ровно четырёх совпадениях", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("находит строку при больше четырёх совпадениях", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал", "Стоимость"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("находит строку при четырех совпадения и когда есть другие заголовки", () => {
        const data = createData([
            ["Отгрузка", "Номенклатура", "Клиент", "Менеджер", "Количество", "Филиал", "Стоимость"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("игнорирует регистр букв", () => {
        const data = createData([
            ["НОМЕНКЛАТУРА", "клиент", "МЕНЕДЖЕР", "фИЛИАЛ"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("игнорирует пробелы в начале и конце заголовков", () => {
        const data = createData([
            [" Номенклатура ", "Клиент  ", " Менеджер", " Филиал "],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(0);
    });

    it("схлопывает несколько пробелов внутри заголовков", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "МЕНЕДЖЕР", "Фи  лиал"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBeNull();
    });

    it("корректно обрабатывает числовые значения в строках", () => {
        const data = createData([
            [123, "Товар 1", 456, "Клиент 1"],
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBe(1);
    });

    it("возвращает null, если совпадения есть только в разных строках", () => {
        const data = createData([
            ["Номенклатура", "Клиент"],
            ["Менеджер", "Филиал"],
        ]);

        expect(findIndexOfHeaderRow(data, titles)).toBeNull();
    });
});
