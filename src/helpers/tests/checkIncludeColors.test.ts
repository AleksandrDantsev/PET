import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkIncludeColors", () => {
    describe("Совпадение цветов по корню", () => {
        it.each([
            ["бел", "Крышка белая КВ-50", true],
            ["бел", "Крышка белая 1810 (28 мм) (5000) КТ", true],
            ["желт", "Крышка желтая СТС 29/13 1011 (5000) Oil BRC", true],
            ["син", "Крышка синяя 066 (SС-1014) (6000) 1881 СК", true],
            ["син", "Ручка 38/2 мм синяя (1760) КТ", true],
            ["красн", "Крышка красная КВ-38 (2300) ЕК", true],
            ["черн", "Крышка черная 832 (SС-1014) (6000) 1881 СК", true],
            ["голуб", "Крышка голубая 1881 КВП-1-28/11 (5600) ЕП", true],
            ["оранжев", "Крышка оранжевая КВ-38 (2300) ЕК", true],
            ["коричнев", "Крышка коричневая 1810 (28 мм) (5000) КТ", true],
            ["бесцветн", "22,5 гр. Oil бесцветная (12936) ЕП", true],
        ])("%s в названии %s → %s", (color, input, expected) => {
            expect(check.checkIncludeColors(color, [input])).toBe(expected);
        });
    });

    describe("Составные цвета", () => {
        it.each([
            ["бел", "Крышка МАСЛО бело-желтый (4000) УП", false],
            ["желт", "Крышка МАСЛО бело-желтый (4000) УП", false],
            ["бел", "Пробка 28 бело-желтый (4500) РП", false],
            ["желт", "Пробка 28 бело-желтый (4500) РП", false],
            ["бел", "Крышка бело желтый", false],
            ["желт", "Крышка бело желтый", false],
            ["бел-желт", "Крышка МАСЛО бело-желтый (4000) УП", true],
        ])("%s в названии %s → %s", (color, input, expected) => {
            expect(check.checkIncludeColors(color, [input])).toBe(expected);
        });
    });

    describe("Массив искомых цветов", () => {
        it("возвращает true, если найден хотя бы один цвет", () => {
            expect(
                check.checkIncludeColors(
                    ["бел", "желт"],
                    ["Крышка синяя", "Крышка белая"]
                )
            ).toBe(true);
        });

        it("возвращает true, если найден цвет из конца массива", () => {
            expect(
                check.checkIncludeColors(
                    ["красн", "син"],
                    ["Крышка белая", "Ручка синяя"]
                )
            ).toBe(true);
        });

        it("возвращает false, если ни один цвет не найден", () => {
            expect(
                check.checkIncludeColors(
                    ["бел", "желт"],
                    ["Крышка синяя", "Крышка красная"]
                )
            ).toBe(false);
        });

        it("возвращает false для пустого массива цветов", () => {
            expect(
                check.checkIncludeColors([], ["Крышка белая"])
            ).toBe(false);
        });
    });

    describe("Массив входных значений", () => {
        it("находит цвет в одном из входных значений", () => {
            expect(
                check.checkIncludeColors(
                    "син",
                    ["Крышка красная", "Ручка синяя", "Крышка белая"]
                )
            ).toBe(true);
        });

        it("возвращает false для пустого массива", () => {
            expect(check.checkIncludeColors("бел", [])).toBe(false);
        });

        it("игнорирует null и undefined", () => {
            expect(
                check.checkIncludeColors(
                    "бел",
                    [null, undefined, "Крышка белая"]
                )
            ).toBe(true);
        });

        it("возвращает false, если все значения пустые", () => {
            expect(
                check.checkIncludeColors("бел", [null, undefined, ""])
            ).toBe(false);
        });
    });

    describe("Пустые и отсутствующие значения", () => {
        it.each([
            [null, ["Крышка белая"]],
            [undefined, ["Крышка белая"]],
            ["", ["Крышка белая"]],
            ["   ", ["Крышка белая"]],
            ["бел", null],
            ["бел", undefined],
        ])("возвращает false для %s и %s", (colors, input) => {
            expect(
                check.checkIncludeColors(
                    colors,
                    input as Array<string | null | undefined>
                )
            ).toBe(false);
        });

        it("возвращает false для пустого массива цветов", () => {
            expect(
                check.checkIncludeColors([], ["Крышка белая"])
            ).toBe(false);
        });

        it("возвращает false для массива из пустых цветов", () => {
            expect(
                check.checkIncludeColors(["", "   "], ["Крышка белая"])
            ).toBe(false);
        });
    });

    describe("Взаимозаменяемые цвета", () => {
        it.each([
            ["син", "Крышка голубая", true],
            ["голуб", "Крышка синяя", true],
            ["син", "Крышка синяя", true],
            ["голуб", "Крышка голубая", true],
            ["син", "Крышка красная", false],
            ["голуб", "Крышка желтая", false],
        ])("%s в названии %s → %s", (color, input, expected) => {
            expect(
                check.checkIncludeColors(color, [input])
            ).toBe(expected);
        });
    });

    describe("Нормализация", () => {
        it("игнорирует регистр", () => {
            expect(
                check.checkIncludeColors("бел", ["КРЫШКА БЕЛАЯ"])
            ).toBe(true);
        });

        it("учитывает лишние пробелы", () => {
            expect(
                check.checkIncludeColors("бел", ["  Крышка   белая  "])
            ).toBe(true);
        });

        it("не находит цвет в слове без соответствующего корня", () => {
            expect(
                check.checkIncludeColors("син", ["Крышка бесцветная"])
            ).toBe(false);
        });

        it("не считает совпадением другой цвет", () => {
            expect(
                check.checkIncludeColors("желт", ["Крышка красная"])
            ).toBe(false);
        });
    });
});
