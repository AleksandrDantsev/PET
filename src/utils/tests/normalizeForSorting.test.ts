import { describe, expect, it } from "vitest";
import { normalizeForSorting } from "../normalize";

describe("normalizeForSorting", () => {
    it.each([
        ["ООО «Ромашка-Сервис»", "оооромашкасервис"],
        ["ооо ромашка сервис", "оооромашкасервис"],
        ["ООО. РОМАШКА, СЕРВИС!", "оооромашкасервис"],
        ["Ёлка", "елка"],
        ["елка", "елка"],
        ["Елка", "елка"],
        ["  Ро маш ка  ", "ромашка"],
        ["Ромашка—Сервис", "ромашкасервис"],
        ["Ромашка/Сервис", "ромашкасервис"],
        ["Товар № 123", "товар123"],
        ["АБВ-123", "абв123"],
    ])("нормализует %s", (input, expected) => {
        expect(normalizeForSorting(input)).toBe(expected);
    });

    it("игнорирует различия в написании при сравнении", () => {
        const first = normalizeForSorting("ООО «Ёлка-Сервис»");
        const second = normalizeForSorting("ооо елка сервис");

        expect(first).toBe(second);
    });

    it("сохраняет регистр при toLowerRegister = false", () => {
        expect(normalizeForSorting("Ромашка-СЕРВИС", false)).toBe(
            "РомашкаСЕРВИС",
        );
    });

    it("возвращает строковое представление null и undefined", () => {
        expect(normalizeForSorting(null)).toBe("null");
        expect(normalizeForSorting(undefined)).toBe("undefined");
    });

    it("корректно обрабатывает числа", () => {
        expect(normalizeForSorting(123)).toBe("123");
        expect(normalizeForSorting(-123)).toBe("123");
        expect(normalizeForSorting(12.5)).toBe("125");
    });

    it("возвращает пустую строку для строки из знаков и пробелов", () => {
        expect(normalizeForSorting(" -.,/()!? ")).toBe("");
    });
});