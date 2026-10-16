import { describe, expect, it } from "vitest";
import { handleFormatNumber } from "../normalize";

describe("handleFormatNumber", () => {
    describe("пустые значения", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["пустая строка", ""],
        ])("возвращает 0 для %s", (_description, value) => {
            expect(handleFormatNumber(value as string)).toBe(0);
        });

        it("возвращает 0 для строки из пробелов", () => {
            expect(handleFormatNumber("   ")).toBe(0);
        });
    });

    describe("числовые значения", () => {
        it.each([
            [0, 0],
            [1, 1],
            [123, 123],
            [1234, 1234],
            [-1, -1],
            [-1234, -1234],
            [1.5, 1.5],
            [-1.5, -1.5],
            [0.25, 0.25],
        ])("для %s возвращает %s", (value, expected) => {
            expect(handleFormatNumber(value)).toBe(expected);
        });
    });

    describe("строковые числа", () => {
        it.each([
            ["0", 0],
            ["123", 123],
            ["-123", -123],
            ["12.5", 12.5],
            ["-12.5", -12.5],
            ["12,5", 12.5],
            ["-12,5", -12.5],
        ])("преобразует «%s» в %s", (value, expected) => {
            expect(handleFormatNumber(value)).toBe(expected);
        });
    });

    describe("пробелы", () => {
        it.each([
            ["1 234", 1234],
            ["1 234 567", 1234567],
            [" 123 ", 123],
            [" 1 234,5 ", 1234.5],
            ["1\t234", 1234],
            ["1\n234", 1234],
            ["1\u00A0234", 1234],
        ])("удаляет пробельные символы в «%s»", (value, expected) => {
            expect(handleFormatNumber(value)).toBe(expected);
        });
    });

    describe("посторонние символы", () => {
        it.each([
            ["123 руб.", 123],
            ["1 234 ₽", 1234],
            ["$123", 123],
            ["abc123", 123],
            ["12abc34", 1234],
            ["1_234", 1234],
            ["12%", 12],
            ["(123)", 123],
        ])("удаляет посторонние символы из «%s»", (value, expected) => {
            expect(handleFormatNumber(value)).toBe(expected);
        });
    });

    describe("десятичный разделитель", () => {
        it.each([
            ["1,5", 1.5],
            ["12,34", 12.34],
            ["1.5", 1.5],
        ])("обрабатывает «%s»", (value, expected) => {
            expect(handleFormatNumber(value)).toBe(expected);
        });
    });

    describe("отрицательные значения", () => {
        it.each([
            ["-0", -0],
            ["-123", -123],
            ["-1 234,5", -1234.5],
            ["−123", 123],
            ["--123", NaN],
            ["12-3", NaN],
            ["-12.5", -12.5],
        ])("обрабатывает «%s»", (value, expected) => {
            const result = handleFormatNumber(value);

            if (Number.isNaN(expected)) {
                expect(result).toBeNaN();
            } else {
                expect(result).toBe(expected);
            }
        });
    });

    describe("некорректные значения", () => {
        it.each([
            ["abc", 0],
            ["не число", 0],
            ["-", NaN],
            [".", NaN],
            [",", NaN],
            ["--", NaN],
            ["1-2", NaN],
        ])("обрабатывает «%s»", (value, expected) => {
            const result = handleFormatNumber(value);

            if (Number.isNaN(expected)) {
                expect(result).toBeNaN();
            } else {
                expect(result).toBe(expected);
            }
        });
    });

    describe("специальные числовые значения", () => {
        it("обрабатывает NaN", () => {
            expect(handleFormatNumber(NaN)).toBe(0);
        });

        it("обрабатывает Infinity", () => {
            expect(handleFormatNumber(Infinity)).toBe(0);
        });

        it("сохраняет дробную часть", () => {
            expect(handleFormatNumber(123.456)).toBe(123.456);
        });

        it("обрабатывает экспоненциальную запись числа", () => {
            expect(handleFormatNumber(1e5)).toBe(100000);
        });

        it("удаляет букву e из экспоненциальной записи строки", () => {
            expect(handleFormatNumber("1e5")).toBe(15);
        });
    });
});