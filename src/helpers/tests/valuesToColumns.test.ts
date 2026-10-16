
import { describe, expect, it } from "vitest";
import { valuesToColumns } from "../dataHandlers";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("valuesToColumns", () => {
    const createData = (
        values: (string | number | boolean)[][]
    ): IGoogleTableData => ({
        values,
    }) as IGoogleTableData;

    it("преобразует строки в колонки", () => {
        const data = createData([
            ["Артикул", "Цена", "Остаток"],
            ["A1", 100, 5],
            ["A2", 200, 10],
            ["A3", 300, 15],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Артикул: ["A1", "A2", "A3"],
            Цена: [100, 200, 300],
            Остаток: [5, 10, 15],
        });
    });

    it("возвращает пустой объект, если values пустой массив", () => {
        const data = createData([]);

        expect(valuesToColumns(data)).toEqual({});
    });

    it("возвращает пустой объект, если строка заголовков отсутствует", () => {
        const data = createData([
            ["Артикул", "Цена"],
        ]);

        expect(valuesToColumns(data, 5)).toEqual({});
    });

    it("использует указанную строку заголовков", () => {
        const data = createData([
            ["Отчёт"],
            ["Дата", "16.10.2026"],
            ["Артикул", "Цена"],
            ["A1", 100],
            ["A2", 200],
        ]);

        expect(valuesToColumns(data, 2)).toEqual({
            Артикул: ["A1", "A2"],
            Цена: [100, 200],
        });
    });

    it("обрезает пробелы в названиях колонок", () => {
        const data = createData([
            [" Артикул ", " Цена "],
            ["A1", 100],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Артикул: ["A1"],
            Цена: [100],
        });
    });

    it("заполняет отсутствующие значения пустыми строками", () => {
        const data = createData([
            ["Артикул", "Цена", "Остаток"],
            ["A1", 100],
            ["A2", 200, 5],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Артикул: ["A1", "A2"],
            Цена: [100, 200],
            Остаток: ["", 5],
        });
    });

    it("удаляет пустые значения в конце каждой колонки", () => {
        const data = createData([
            ["Артикул", "Цена"],
            ["A1", 100],
            ["", 200],
            ["   ", ""],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Артикул: ["A1"],
            Цена: [100, 200],
        });
    });

    it("сохраняет логические значения и нули", () => {
        const data = createData([
            ["Активен", "Количество"],
            [true, 0],
            [false, 5],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Активен: [true, false],
            Количество: [0, 5],
        });
    });

    it("использует последнюю колонку при дублировании заголовков", () => {
        const data = createData([
            ["Цена", "Цена"],
            [100, 200],
            [300, 400],
        ]);

        expect(valuesToColumns(data)).toEqual({
            Цена: [200, 400],
        });
    });
});
