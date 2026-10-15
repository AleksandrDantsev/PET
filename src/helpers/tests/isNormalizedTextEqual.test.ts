import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("isNormalizedTextEqual", () => {
    describe("Совпадение после нормализации", () => {
        it.each([
            ["Крышка белая", "Крышка белая", true],
            ["КРЫШКА БЕЛАЯ", "крышка белая", true],
            ["Крышка белая", "  Крышка белая  ", true],
            ["Крышка   белая", "Крышка белая", true],
            ["ёлка", "елка", true],
            ["ЁЖ", "еж", true],
            ["Крышка (белая)", "Крышка белая", true],
            ["Крышка, белая.", "Крышка белая", true],
            ['Крышка "белая"', "Крышка белая", true],
            ["Крышка «белая»", "Крышка белая", true],
        ])("%s и %s → %s", (listText, inputText, expected) => {
            expect(
                check.isNormalizedTextEqual(listText, inputText)
            ).toBe(expected);
        });
    });

    describe("Несовпадающие значения", () => {
        it.each([
            ["Крышка белая", "Крышка желтая", false],
            ["Крышка белая", "Крышка белый", false],
            ["Крышка белая", "Крышка белая 28", false],
            ["Крышка белая 28", "Крышка белая", false],
            ["Крышка белая", "Крышка синяя", false],
            ["масло", "масло крышка", false],
            ["123", "124", false],
        ])("%s и %s → %s", (listText, inputText, expected) => {
            expect(
                check.isNormalizedTextEqual(listText, inputText)
            ).toBe(expected);
        });
    });

    describe("Пустые и отсутствующие значения", () => {
        it.each([
            [null, "Крышка белая"],
            [undefined, "Крышка белая"],
            ["Крышка белая", null],
            ["Крышка белая", undefined],
            ["", "Крышка белая"],
            ["Крышка белая", ""],
            ["   ", "Крышка белая"],
            ["Крышка белая", "   "],
            ["", ""],
            ["   ", "   "],
        ])("возвращает false для %s и %s", (listText, inputText) => {
            expect(
                check.isNormalizedTextEqual(listText, inputText)
            ).toBe(false);
        });
    });

    describe("Нормализация пунктуации", () => {
        it.each([
            ["А (Б)", "А Б", true],
            ["А[Б]", "А Б", true],
            ["А{Б}", "А Б", true],
            ["А,Б", "А Б", true],
            ["А.Б", "А Б", true],
            ["А;Б", "А Б", true],
            ["А:Б", "А Б", true],
            ["А'Б", "А Б", true],
            ["А-Б", "А Б", false],
        ])("%s и %s → %s", (listText, inputText, expected) => {
            expect(
                check.isNormalizedTextEqual(listText, inputText)
            ).toBe(expected);
        });
    });
});