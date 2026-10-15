import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkGrams", () => {
    describe("Проверка диапазона", () => {
        it.each([
            [{ from: 100, to: 500 }, 300, true],
            [{ from: 100, to: 500 }, 100, true],
            [{ from: 100, to: 500 }, 500, true],
            [{ from: 100, to: 500 }, 99.5, false],
            [{ from: 100, to: 500 }, 105.5, true],
            [{ from: 100, to: 500 }, 500.5, false],
            [{ from: 100, to: 500 }, 99, false],
            [{ from: 100, to: 500 }, 501, false],
            [{ from: 100, to: 500 }, 0, false],
            [{ from: 0, to: 0 }, 0, true],
            [{ from: 0, to: 100 }, 0, true],
        ])(
            "диапазон %o, значение %s → %s",
            (range, grams, expected) => {
                expect(check.checkGrams(range, grams)).toBe(expected);
            }
        );
    });

    describe("Строковые значения", () => {
        it.each([
            [{ from: "100", to: "500" }, "300", true],
            [{ from: "100", to: "500" }, "100", true],
            [{ from: "100", to: "500" }, "500", true],
            [{ from: "100", to: "500" }, "99", false],
            [{ from: "100", to: "500" }, "501", false],
            [{ from: 100, to: 500 }, "300", true],
            [{ from: "100", to: "500" }, 300, true],
        ])(
            "диапазон %o, значение %s → %s",
            (range, grams, expected) => {
                expect(check.checkGrams(range, grams)).toBe(expected);
            }
        );
    });

    describe("Некорректные значения", () => {
        it.each([
            [{ from: "abc", to: 500 }, 300],
            [{ from: 100, to: "abc" }, 300],
            [{ from: 100, to: 500 }, "abc"],
            [{ from: Number.NaN, to: 500 }, 300],
            [{ from: 100, to: Number.NaN }, 300],
            [{ from: 100, to: 500 }, Number.NaN],
            [{ from: Number.POSITIVE_INFINITY, to: 500 }, 300],
            [{ from: 100, to: Number.POSITIVE_INFINITY }, 300],
        ])("возвращает false для диапазона %o и значения %s", (range, grams) => {
            expect(check.checkGrams(range, grams)).toBe(false);
        });
    });

    describe("Отсутствующие значения", () => {
        const cases = [
            { range: null, grams: 300 },
            { range: undefined, grams: 300 },
            { range: { from: null, to: 500 }, grams: 300 },
            { range: { from: undefined, to: 500 }, grams: 300 },
            { range: { from: 100, to: null }, grams: 300 },
            { range: { from: 100, to: undefined }, grams: 300 },
            { range: { from: 100, to: 500 }, grams: null },
            { range: { from: 100, to: 500 }, grams: undefined },
        ] satisfies Array<{
            range:
                | { from: number | null | undefined; to: number | null | undefined }
                | null
                | undefined;
            grams: string | number | null | undefined;
        }>;

        it.each(cases)(
            "возвращает false для диапазона $range и значения $grams",
            ({ range, grams }) => {
                expect(
                    check.checkGrams(
                        range as Parameters<typeof check.checkGrams>[0],
                        grams
                    )
                ).toBe(false);
            }
        );
    });

    describe("Порядок границ", () => {
        it("возвращает false, если from больше to", () => {
            expect(
                check.checkGrams({ from: 500, to: 100 }, 300)
            ).toBe(false);
        });

        it("возвращает true для совпадающих границ и значения", () => {
            expect(
                check.checkGrams({ from: 300, to: 300 }, 300)
            ).toBe(true);
        });

        it("возвращает false для совпадающих границ и другого значения", () => {
            expect(
                check.checkGrams({ from: 300, to: 300 }, 301)
            ).toBe(false);
        });
    });
});