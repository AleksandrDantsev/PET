import { describe, expect, it } from "vitest";
import { formatCost } from "../normalize";

describe("formatCost", () => {
    describe("пустые значения", () => {
        it.each([
            ["undefined", undefined],
            ["пустая строка", ""],
            ["null", null],
        ])("возвращает пустую строку для %s", (_description, value) => {
            expect(formatCost(value as string)).toBe("");
        });
    });

    describe("целые числа", () => {
        it.each([
            [0, "0"],
            [1, "1"],
            [12, "12"],
            [123, "123"],
            [1234, "1 234"],
            [12345, "12 345"],
            [123456, "123 456"],
            [1234567, "1 234 567"],
            [-1, "-1"],
            [-1234, "-1 234"],
            [-1234567, "-1 234 567"],
        ])("форматирует %s", (value, expected) => {
            expect(formatCost(value)).toBe(expected);
        });
    });

    describe("строковые числа", () => {
        it.each([
            ["0", "0"],
            ["123", "123"],
            ["1234", "1 234"],
            ["1234567", "1 234 567"],
            ["-1234", "-1 234"],
            ["001234", "1 234"],
        ])("форматирует строку «%s»", (value, expected) => {
            expect(formatCost(value)).toBe(expected);
        });
    });

    describe("дробные числа", () => {
        it.each([
            [1.1, "1"],
            [1.4, "1"],
            [1.5, "2"],
            [1.9, "2"],
            [2.5, "3"],
            [1234.5, "1 235"],
            [-1.5, "-2"],
            [-1234.5, "-1 235"],
        ])("округляет %s до целого числа", (value, expected) => {
            expect(formatCost(value)).toBe(expected);
        });
    });

    describe("десятичная запятая и точка", () => {
        it.each([
            ["1,5", "2"],
            ["1,4", "1"],
            ["1234,5", "1 235"],
            ["1234.5", "1 235"],
            ["-1,5", "-2"],
            ["0,4", "0"],
        ])("форматирует значение «%s»", (value, expected) => {
            expect(formatCost(value)).toBe(expected);
        });
    });

    describe("пробелы в значении", () => {
        it.each([
            [" 1234 ", "1 234"],
            ["1 234", "1 234"],
            ["1 234", "1 234"],
            ["1 234 567", "1 234 567"],
            [" 1 234,5 ", "1 235"],
        ])("удаляет пробелы из «%s»", (value, expected) => {
            expect(formatCost(value)).toBe(expected);
        });
    });

    describe("некорректные значения", () => {
        it.each([
            ["abc"],
            ["не число"],
            ["123abc"],
            ["1,2,3"],
            ["1.2.3"],
            ["Infinity"],
            ["-Infinity"],
            ["NaN"],
        ])("возвращает пустую строку для «%s»", (value) => {
            expect(formatCost(value)).toBe("");
        });
    });

    describe("логические и специальные числовые случаи", () => {
        it.each([
            [Number.NaN],
            [Number.POSITIVE_INFINITY],
            [Number.NEGATIVE_INFINITY],
        ])("возвращает пустую строку для %s", (value) => {
            expect(formatCost(value)).toBe("");
        });

        it("округляет очень маленькое положительное число до нуля", () => {
            expect(formatCost(0.1)).toBe("0");
        });

        it("форматирует очень большие конечные числа", () => {
            expect(formatCost(1e15)).toBe("1 000 000 000 000 000");
        });
    });
});