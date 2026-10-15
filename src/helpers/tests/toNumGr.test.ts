import { describe, expect, it } from "vitest";
import { ih } from "../interchangeableFilters";

describe("toNumGr", () => {
    describe("Корректные значения", () => {
        it.each([
            ["12", 12],
            ["1810", 1810],
            ["12.5", 12.5],
            ["12,5", 12.5],
            ["22,5", 22.5],
            ["60,5", 60.5],
            ["0", 0],
            ["0,5", 0.5],
            ["-12,5", -12.5],
            [12, 12],
            [12.5, 12.5],
            [0, 0],
            [-12.5, -12.5],
        ])("%s → %s", (input, expected) => {
            expect(ih.toNumGr(input)).toBe(expected);
        });
    });

    describe("Пробелы", () => {
        it.each([
            [" 12 ", 12],
            [" 22,5 ", 22.5],
            ["\t12,5\n", 12.5],
        ])("обрабатывает пробелы: %j → %s", (input, expected) => {
            expect(ih.toNumGr(input)).toBe(expected);
        });
    });

    describe("Пустые значения", () => {
        it.each([null, undefined, ""])(
            "возвращает NaN для %s",
            (input) => {
                expect(ih.toNumGr(input)).toBeNaN();
            }
        );
    });

    describe("Некорректные значения", () => {
        it.each([
            "abc",
            "12abc",
            "abc12",
            "12,5 гр.",
            "12.5.6",
            "12,5,6",
            " ",
            "NaN",
            "Infinity",
            "-Infinity",
        ])("возвращает NaN для %j", (input) => {
            expect(ih.toNumGr(input)).toBeNaN();
        });
    });

    describe("Граничные значения", () => {
        it("обрабатывает очень большое число", () => {
            expect(ih.toNumGr("1e+308")).toBe(1e308);
        });

        it("возвращает NaN для бесконечного результата", () => {
            expect(ih.toNumGr("1e309")).toBeNaN();
        });

        it("обрабатывает строку с отрицательным нулём", () => {
            expect(ih.toNumGr("-0")).toBe(-0);
        });
    });
});