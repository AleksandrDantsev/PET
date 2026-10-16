import { describe, it, expect, vi, afterEach } from "vitest";
import { getConfigManagersBranchList } from "../configHandlers";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("getConfigManagersBranchList", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createData = (
        rows: (string | number | boolean | null | undefined)[][]
    ): IGoogleTableData => ({
        values: rows as IGoogleTableData["values"],
    });

    it("возвращает список менеджеров и филиалов", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Симферополь"],
            ["Петров", "Севастополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
            Петров: "Севастополь",
        });
    });

    it("возвращает null для null", () => {
        expect(getConfigManagersBranchList(null)).toBeNull();
    });

    it("возвращает null, если values отсутствует", () => {
        expect(
            getConfigManagersBranchList({} as IGoogleTableData)
        ).toBeNull();
    });

    it("возвращает null, если отсутствует колонка МЕНЕДЖЕРЫ", () => {
        const data = createData([
            ["ФИЛИАЛЫ"],
            ["Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toBeNull();
    });

    it("возвращает null, если отсутствует колонка ФИЛИАЛЫ", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ"],
            ["Иванов"],
        ]);

        expect(getConfigManagersBranchList(data)).toBeNull();
    });

    it("возвращает null, если заголовки отсутствуют", () => {
        const data = createData([]);

        expect(getConfigManagersBranchList(data)).toBeNull();
    });

    it("возвращает пустой объект, если строки данных отсутствуют", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({});
    });

    it("удаляет пробелы в начале и конце имени менеджера", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["  Иванов  ", "Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("схлопывает повторяющиеся пробелы в имени менеджера", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов    Иван Иванович", "Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            "Иванов Иван Иванович": "Симферополь",
        });
    });

    it("удаляет пробелы в начале и конце названия филиала", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "  Симферополь  "],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("схлопывает повторяющиеся пробелы в названии филиала", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Южный    филиал"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Южный филиал",
        });
    });

    it("не различает менеджеров по регистру", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Симферополь"],
            ["ИВАНОВ", "Севастополь"],
            ["иванов", "Ялта"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("не различает менеджеров по пробелам и регистру одновременно", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов Иванович", "Симферополь"],
            ["  ИВАНОВ   ИВАНОВИЧ  ", "Севастополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            "Иванов Иванович": "Симферополь",
        });
    });

    it("считает буквы ё и е эквивалентными при поиске дублей", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Семёнов", "Симферополь"],
            ["Семенов", "Севастополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Семёнов: "Симферополь",
        });
    });

    it("пропускает пустые имена менеджеров", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["", "Симферополь"],
            ["   ", "Севастополь"],
            ["Иванов", "Ялта"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Ялта",
        });
    });

    it("сохраняет пустой филиал, если он не указан", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", ""],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "",
        });
    });

    it("сохраняет пустой филиал, если значение отсутствует", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "",
        });
    });

    it("сохраняет нулевое значение менеджера как строку", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            [0, "Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            "0": "Симферополь",
        });
    });

    it("преобразует числовое название филиала в строку", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", 123],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "123",
        });
    });

    it("сохраняет первого менеджера при конфликте филиалов", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Симферополь"],
            ["ИВАНОВ", "Севастополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("сохраняет первого менеджера при повторении с тем же филиалом", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Симферополь"],
            [" Иванов ", " Симферополь "],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("не объединяет разных менеджеров одного филиала", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["Иванов", "Симферополь"],
            ["Петров", "Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
            Петров: "Симферополь",
        });
    });

    it("не изменяет исходные данные", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["  Иванов  ", "  Симферополь  "],
        ]);

        const originalValues = structuredClone(data.values);

        getConfigManagersBranchList(data);

        expect(data.values).toEqual(originalValues);
    });

    it("не вызывает ошибку, если все имена менеджеров пустые", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ"],
            ["", "Симферополь"],
            ["   ", "Севастополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({});
    });

    it("учитывает заголовки с пробелами по краям", () => {
        const data = createData([
            [" МЕНЕДЖЕРЫ ", " ФИЛИАЛЫ "],
            ["Иванов", "Симферополь"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Иванов: "Симферополь",
        });
    });

    it("использует последнюю колонку при повторяющемся заголовке МЕНЕДЖЕРЫ", () => {
        const data = createData([
            ["МЕНЕДЖЕРЫ", "ФИЛИАЛЫ", "МЕНЕДЖЕРЫ"],
            ["Иванов", "Симферополь", "Петров"],
        ]);

        expect(getConfigManagersBranchList(data)).toEqual({
            Петров: "Симферополь",
        });
    });
});