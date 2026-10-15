import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkStandart", () => {
    describe("Точное совпадение", () => {
        it.each([
            ["1810", "1810", true],
            ["BPF", "BPF", true],
            ["Oil", "Oil", true],
            ["BPF", "Oil", false],
            ["1810", "1881", false],
        ])("%s и %s → %s", (list, input, expected) => {
            expect(check.checkStandart(list, input)).toBe(expected);
        });
    });

    describe("Массив стандартов", () => {
        it.each([
            ["1810", ["1810", "1881"], true],
            ["181", ["1810"], false],
            ["КВ-38", ["КВ-380"], false],
            ["Крышка 38 мм черная (3300) КТ", ["38"], true],
            ["Крышка 138 мм черная (3300) КТ", ["38"], false],
            ["Крышка 380 мм черная (3300) КТ", ["38"], false],
        ])("%s, стандарты %j → %s", (list, input, expected) => {
            expect(check.checkStandart(list, input)).toBe(expected);
        });
    });

    describe("Поиск внутри названия товара", () => {
        it.each([
            ["1810", "Крышка белая 1810 (5000) КТ", true],
            ["КВ-38", "Крышка белая КВ-38 (5000) КТ", true],
            ["1810", "Крышка белая 1881 (5000) КТ", false],
            ["38", "Крышка КВ-38 (5000) КТ", true],
            ["38", "Крышка КВ-380 (5000) КТ", false],
            ["BPF", "Преформа BPF (5000)", true],
            ["BPF", "Преформа BPFX (5000)", false],
            ["КВ-38", "Крышка белая КВ-381 (5000) КТ", false],
        ])("%s в «%s» → %s", (standard, name, expected) => {
            expect(check.checkStandart(standard, name)).toBe(expected);
        });
    });

    describe("Нормализация", () => {
        it.each([
            ["кв-38", "Крышка белая КВ-38 (5000) КТ", true],
            ["bpf", "Преформа BPF (5000)", true],
            ["1810", "Крышка белая 1810 (5000) КТ", true],
        ])("%s в «%s» → %s", (standard, name, expected) => {
            expect(check.checkStandart(standard, name)).toBe(expected);
        });
    });

    describe("Числовые границы", () => {
        it.each([
            ["38", "Крышка 38 мм черная (3300) КТ", true],
            ["38", "Крышка 138 мм черная (3300) КТ", false],
            ["38", "Крышка 380 мм черная (3300) КТ", false],
            ["181", "Крышка 1810 мм", false],
        ])("%s в «%s» → %s", (standard, name, expected) => {
            expect(check.checkStandart(standard, name)).toBe(expected);
        });
    });

    describe("Пустые и отсутствующие значения", () => {
        it.each([
            [null, "1810"],
            ["1810", null],
            [undefined, "1810"],
            ["1810", undefined],
            ["", "1810"],
            ["1810", ""],
            ["   ", "1810"],
            ["1810", "   "],
        ])("возвращает false для %j и %j", (list, input) => {
            expect(check.checkStandart(list, input)).toBe(false);
        });
    });
});