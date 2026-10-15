import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkType", () => {
    describe("Сравнение типов", () => {
        it.each([
            ["крышка", "крышка", true],
            ["преформа", "преформа", true],
            ["ручка", "ручка", true],
            ["колпачок", "колпачок", true],
            ["крышка", "ручка", false],
            ["преформа", "колпачок", false],
        ])("%s и %s → %s", (listType, inputType, expected) => {
            expect(check.checkType(listType, inputType)).toBe(expected);
        });
    });

    describe("Нормализация регистра", () => {
        it("считает одинаковыми строки в разном регистре", () => {
            expect(check.checkType("КРЫШКА", "крышка")).toBe(true);
        });

        it("считает одинаковыми строки со смешанным регистром", () => {
            expect(check.checkType("ПрЕфОрМа", "ПРЕФОРМА")).toBe(true);
        });
    });

    describe("Нормализация ё и е", () => {
        it("считает ё и е эквивалентными", () => {
            expect(check.checkType("чёрный", "черный")).toBe(true);
        });
    });

    describe("Нормализация пробелов", () => {
        it("игнорирует пробелы по краям", () => {
            expect(check.checkType(" крышка ", "крышка")).toBe(true);
        });

        it("схлопывает повторяющиеся пробелы", () => {
            expect(check.checkType("тип   товара", "тип товара")).toBe(true);
        });

        it("считает разные внутренние пробелы эквивалентными", () => {
            expect(check.checkType("тип\tтовара", "тип товара")).toBe(true);
        });
    });

    describe("Пустые и отсутствующие значения", () => {
        it.each([
            [null, null, true],
            [undefined, undefined, true],
            [null, undefined, true],
            ["", "", true],
            ["   ", "", true],
            [null, "крышка", false],
            ["крышка", undefined, false],
            ["", "ручка", false],
        ])(
            "checkType(%s, %s) → %s",
            (listType, inputType, expected) => {
                expect(check.checkType(listType, inputType)).toBe(expected);
            },
        );
    });

    describe("Точное совпадение после нормализации", () => {
        it("не считает совпадением частичное вхождение", () => {
            expect(check.checkType("крышка", "крышка белая")).toBe(false);
        });

        it("не считает совпадением разные строки", () => {
            expect(check.checkType("РП", "РПБ")).toBe(false);
        });

        it("не удаляет дефисы при сравнении", () => {
            expect(check.checkType("бело-желтый", "бело желтый")).toBe(false);
        });
    });
});
