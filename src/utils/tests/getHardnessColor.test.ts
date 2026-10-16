import { describe, expect, it } from "vitest";
import { getHardnessColor } from "../colorHelpers";

describe("getHardnessColor", () => {
    describe("пустые значения", () => {
        it.each([
            ["undefined", undefined],
            ["число 0", 0],
            ["строка с нулём", "0"],
            ["пустая строка", ""],
        ])("возвращает black для %s", (_description, value) => {
            expect(getHardnessColor(value)).toBe("black");
        });
    });

    describe("зелёный цвет — до 15 дней включительно", () => {
        it.each([
            [1, "#43a047"],
            [5, "#43a047"],
            [10, "#43a047"],
            [14, "#43a047"],
            [15, "#43a047"],
            [-1, "#43a047"],
            [-15, "#43a047"],
        ])("для %s возвращает зелёный цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("жёлтый цвет — от 16 до 30 дней", () => {
        it.each([
            [16, "#faf60c"],
            [20, "#faf60c"],
            [29, "#faf60c"],
            [30, "#faf60c"],
        ])("для %s возвращает жёлтый цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("оранжевый цвет — от 31 до 105 дней", () => {
        it.each([
            [31, "#fb8c00"],
            [45, "#fb8c00"],
            [60, "#fb8c00"],
            [100, "#fb8c00"],
            [104, "#fb8c00"],
            [105, "#fb8c00"],
        ])("для %s возвращает оранжевый цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("красный цвет — больше 105 дней", () => {
        it.each([
            [106, "#e53935"],
            [120, "#e53935"],
            [180, "#e53935"],
            [365, "#e53935"],
            [1000, "#e53935"],
        ])("для %s возвращает красный цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("строковые значения", () => {
        it.each([
            ["1", "#43a047"],
            ["15", "#43a047"],
            ["16", "#faf60c"],
            ["30", "#faf60c"],
            ["31", "#fb8c00"],
            ["105", "#fb8c00"],
            ["106", "#e53935"],
            ["200", "#e53935"],
        ])("для строки «%s» возвращает ожидаемый цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("дробные значения", () => {
        it.each([
            [15.5, "#faf60c"],
            [30.5, "#fb8c00"],
            [105.5, "#e53935"],
            [-0.5, "#43a047"],
        ])("для %s возвращает ожидаемый цвет", (days, expected) => {
            expect(getHardnessColor(days)).toBe(expected);
        });
    });

    describe("некорректные значения", () => {
        it.each([
            ["abc"],
            ["не число"],
            ["15 дней"],
            ["NaN"],
        ])("возвращает 'black' строку для «%s»", (days) => {
            expect(getHardnessColor(days)).toBe("black");
        });
    });
});