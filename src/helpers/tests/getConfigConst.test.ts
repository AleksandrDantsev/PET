
import { describe, expect, it } from "vitest";
import { getConfigConst } from "../configHandlers";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("getConfigConst", () => {
    const createData = (
        values: (string | number | boolean)[][]
    ): IGoogleTableData => ({
        values,
    }) as IGoogleTableData;

    it("возвращает объект констант и соответствующих заголовков", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["PRODUCT", "Номенклатура"],
            ["CLIENT", "Клиент"],
            ["MANAGER", "Менеджер"],
            ["BRANCH", "Филиал"],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Номенклатура",
            CLIENT: "Клиент",
            MANAGER: "Менеджер",
            BRANCH: "Филиал",
        });
    });

    it("возвращает null, если data равен null", () => {
        expect(getConfigConst(null)).toBeNull();
    });

    it("возвращает null, если values отсутствует", () => {
        expect(getConfigConst({} as IGoogleTableData)).toBeNull();
    });

    it("возвращает null, если values пустой массив", () => {
        expect(getConfigConst(createData([]))).toBeNull();
    });

    it("возвращает null, если отсутствует колонка КОНСТАНТЫ ЗАГОЛОВКОВ", () => {
        const data = createData([
            ["ЗАГОЛОВКИ"],
            ["Номенклатура"],
            ["Клиент"],
        ]);

        expect(getConfigConst(data)).toBeNull();
    });

    it("возвращает null, если отсутствует колонка ЗАГОЛОВКИ", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ"],
            ["PRODUCT"],
            ["CLIENT"],
        ]);

        expect(getConfigConst(data)).toBeNull();
    });

    it("пропускает пустые константы", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["PRODUCT", "Номенклатура"],
            ["", "Клиент"],
            ["   ", "Менеджер"],
            ["BRANCH", "Филиал"],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Номенклатура",
            BRANCH: "Филиал",
        });
    });

    it("сохраняет константу с пустым заголовком", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["PRODUCT", "Номенклатура"],
            ["CLIENT", ""],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Номенклатура",
            CLIENT: "",
        });
    });

    it("преобразует числовые значения в строки", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            [123, 456],
            [789, 101],
        ]);

        expect(getConfigConst(data)).toEqual({
            "123": "456",
            "789": "101",
        });
    });

    it("возвращает пустой объект, если все константы пустые", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["", "Номенклатура"],
            ["   ", "Клиент"],
        ]);

        expect(getConfigConst(data)).toEqual({});
    });

    it("использует последнее значение при повторении константы", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["PRODUCT", "Номенклатура"],
            ["PRODUCT", "Товар"],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Товар",
        });
    });

    it("подставляет пустую строку, если для константы нет соответствующего заголовка", () => {
        const data = createData([
            ["КОНСТАНТЫ ЗАГОЛОВКОВ", "ЗАГОЛОВКИ"],
            ["PRODUCT", "Номенклатура"],
            ["CLIENT", ""],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Номенклатура",
            CLIENT: "",
        });
    });

    it("обрезает пробелы в названиях колонок", () => {
        const data = createData([
            [" КОНСТАНТЫ ЗАГОЛОВКОВ ", " ЗАГОЛОВКИ "],
            ["PRODUCT", "Номенклатура"],
            ["CLIENT", "Клиент"],
        ]);

        expect(getConfigConst(data)).toEqual({
            PRODUCT: "Номенклатура",
            CLIENT: "Клиент",
        });
    });
});
