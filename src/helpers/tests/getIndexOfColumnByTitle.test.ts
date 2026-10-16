
import { describe, expect, it } from "vitest";
import { getIndexOfColumnByTitle } from "../auxiliaryTableFuncs";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("getIndexOfColumnByTitle", () => {
    const createData = (
        values: (string | number)[][]
    ): IGoogleTableData => ({
        values,
    }) as IGoogleTableData;

    it("находит заголовок в первой строке по умолчанию", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Клиент")).toBe(1);
    });

    it("возвращает индекс первого столбца", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Номенклатура")).toBe(0);
    });

    it("возвращает индекс последнего столбца", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Филиал")).toBe(3);
    });

    it("находит заголовок в указанной строке", () => {
        const data = createData([
            ["Отчёт за неделю"],
            ["Дата", "16.10.2026"],
            ["Номенклатура", "Клиент", "Менеджер", "Филиал"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Менеджер", 2)).toBe(2);
    });

    it("игнорирует регистр букв", () => {
        const data = createData([
            ["НОМЕНКЛАТУРА", "КЛИЕНТ", "менеджер"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Клиент")).toBe(1);
    });

    it("игнорирует пробелы в начале и конце заголовка", () => {
        const data = createData([
            [" Номенклатура ", "  Клиент", "Менеджер  "],
        ]);

        expect(getIndexOfColumnByTitle(data, " Клиент ")).toBe(1);
    });

    it("корректно обрабатывает числовые значения в заголовках", () => {
        const data = createData([
            [123, "Клиент", 456],
        ]);

        expect(getIndexOfColumnByTitle(data, "123")).toBe(0);
        expect(getIndexOfColumnByTitle(data, "456")).toBe(2);
    });

    it("возвращает null, если заголовок не найден", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Филиал")).toBeNull();
    });

    it("возвращает null, если values пустой массив", () => {
        const data = createData([]);

        expect(getIndexOfColumnByTitle(data, "Клиент")).toBeNull();
    });

    it("возвращает null, если указанной строки заголовков нет", () => {
        const data = createData([
            ["Номенклатура", "Клиент"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Клиент", 5)).toBeNull();
    });

    it("возвращает null, если values отсутствует", () => {
        expect(
            getIndexOfColumnByTitle(
                {} as IGoogleTableData,
                "Клиент"
            )
        ).toBeNull();
    });

    it("возвращает null для пустого заголовка, если совпадений нет", () => {
        const data = createData([
            ["Номенклатура", "Клиент", "Менеджер"],
        ]);

        expect(getIndexOfColumnByTitle(data, "")).toBeNull();
    });

    it("возвращает индекс первого совпадения при дублирующихся заголовках", () => {
        const data = createData([
            ["Клиент", "Менеджер", "Клиент"],
        ]);

        expect(getIndexOfColumnByTitle(data, "Клиент")).toBe(0);
    });
});
