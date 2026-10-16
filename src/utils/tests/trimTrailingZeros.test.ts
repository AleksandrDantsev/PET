
import { describe, expect, it } from "vitest";
import { trimTrailingZeros } from "../normalize";

describe("trimTrailingZeros", () => {
    describe("пустые значения", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["пустая строка", ""],
        ])("возвращает исходное значение для %s", (_description, value) => {
            expect(trimTrailingZeros(value)).toBe(value);
        });
    });

    describe("удаление конечных нулей", () => {
        it.each([
            ["12,3400", "12.34"],
            ["12,3000", "12.3"],
            ["12,000", "12"],
            ["0,000", "0"],
            ["123,45000", "123.45"],
            ["1,23004000", "1.23004"],
            ["100,01000", "100.01"],
            ["0,10000", "0.1"],
        ])("преобразует %s в %s", (input, expected) => {
            expect(trimTrailingZeros(input)).toBe(expected);
        });
    });

    describe("значения без конечных нулей", () => {
        it.each([
            ["12,34", "12.34"],
            ["123,456", "123.456"],
            ["0,1", "0.1"],
            ["12", "12"],
            ["0", "0"],
            ["-12,34", "-12.34"],
        ])("обрабатывает %s", (input, expected) => {
            expect(trimTrailingZeros(input)).toBe(expected);
        });
    });

    describe("числовые значения", () => {
        it.each([
            [12, "12"],
            [12.5, "12.5"],
            [0, "0"],
            [-10, "-10"],
            [-12.5, "-12.5"],
            [1000, "1000"],
        ])("преобразует число %s в строку %s", (input, expected) => {
            expect(trimTrailingZeros(input)).toBe(expected);
        });
    });

    describe("строки с точкой", () => {
        it.each([
            ["12.3400", "12.3400"],
            ["1.200", "1.200"],
            ["123.000", "123.000"],
        ])("не удаляет конечные нули в %s", (input, expected) => {
            expect(trimTrailingZeros(input)).toBe(expected);
        });
    });

    describe("особые случаи", () => {
        it.each([
            ["строка без чисел", "abc", "abc"],
            ["строка из пробелов", "   ", "   "],
            ["строка с одной запятой", ",", "."],
            ["запятая с нулями", ",000", ""],
            ["несколько запятых", "1,2,3", "1.2,3"],
            ["целое число с запятой", "12,", "12."],
            ["минус без дробной части", "-12,000", "-12"],
        ])("обрабатывает случай: %s", (_description, input, expected) => {
            expect(trimTrailingZeros(input)).toBe(expected);
        });
    });
});
