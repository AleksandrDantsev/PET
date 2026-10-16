import { describe, expect, it } from "vitest";
import { toNumber } from "../normalize";

describe("toNumber", () => {
    describe("пустые значения", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["пустая строка", ""],
        ])("возвращает null для %s", (_description, value) => {
            expect(toNumber(value)).toBeNull();
        });

        it("возвращает null для строки из пробелов", () => {
            expect(toNumber("   ")).toBe(0);
        });
    });

    describe("числа", () => {
        it.each([
            ["положительное целое", 123, 123],
            ["отрицательное целое", -123, -123],
            ["ноль", 0, 0],
            ["дробное число", 12.5, 12.5],
            ["отрицательное дробное", -12.5, -12.5],
        ])("обрабатывает %s", (_description, value, expected) => {
            expect(toNumber(value)).toBe(expected);
        });
    });

    describe("строки с числами", () => {
        it.each([
            ["целое число", "123", 123],
            ["отрицательное число", "-123", -123],
            ["десятичная точка", "12.5", 12.5],
            ["десятичная запятая", "12,5", 12.5],
            ["пробелы по краям", " 123 ", 123],
            ["пробел внутри числа", "1 234", 1234],
            ["несколько пробелов", "1 2 3", 123],
            ["неразрывный пробел", "1\u00A0234", 1234],
            ["ноль в строке", "0", 0],
            ["число с плюсом", "+123", 123],
        ])("обрабатывает %s", (_description, value, expected) => {
            expect(toNumber(value)).toBe(expected);
        });
    });

    describe("некорректные значения", () => {
        it.each([
            ["текст", "abc"],
            ["число с буквами", "123abc"],
            ["несколько десятичных запятых", "1,2,3"],
            ["несколько десятичных точек", "1.2.3"],
            ["пустая строка с пробелами и текстом", "   abc   "],
        ])("возвращает null для значения: %s", (_description, value) => {
            expect(toNumber(value)).toBeNull();
        });
    });

    describe("особенности преобразования", () => {
        it("преобразует массив из одного числа в число", () => {
            expect(toNumber([123])).toBe(123);
        });

        it("возвращает null для объекта", () => {
            expect(toNumber({ value: 123 })).toBeNull();
        });
    });

    describe("специальные числовые значения", () => {
        it("возвращает Infinity для строки Infinity", () => {
            expect(toNumber("Infinity")).toBe(Infinity);
        });

        it("возвращает null для NaN", () => {
            expect(toNumber(NaN)).toBeNull();
        });

        it("возвращает null для строки NaN", () => {
            expect(toNumber("NaN")).toBeNull();
        });
    });
});