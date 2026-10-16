
import { describe, expect, it } from "vitest";
import { cutOverflowedText } from "../normalize";

describe("cutOverflowedText", () => {
    describe("пустые значения", () => {
        it.each([
            ["undefined", undefined],
            ["пустая строка", ""],
            ["число 0", 0],
            ["false", false as unknown as string],
        ])("возвращает пустую строку для %s", (_description, value) => {
            expect(cutOverflowedText(value)).toBe("");
        });
    });

    describe("строки короче лимита", () => {
        it.each([
            ["короткая строка", "Hello", 30, "Hello"],
            ["пустая после преобразования строка", "", 30, ""],
            ["строка из одного символа", "A", 30, "A"],
            ["строка с пробелами", "Hello World", 30, "Hello World"],
            ["строка с кириллицей", "Привет, мир!", 30, "Привет, мир!"],
        ])("возвращает исходное значение: %s", (_description, value, quantityLetter, expected) => {
            expect(cutOverflowedText(value, quantityLetter)).toBe(expected);
        });
    });

    describe("строки на границе лимита", () => {
        it("не добавляет многоточие, если длина равна лимиту", () => {
            expect(cutOverflowedText("12345", 5)).toBe("12345");
        });

        it("не обрезает строку, если длина меньше лимита на один символ", () => {
            expect(cutOverflowedText("1234", 5)).toBe("1234");
        });

        it("обрезает строку, если длина превышает лимит на один символ", () => {
            expect(cutOverflowedText("123456", 5)).toBe("12345...");
        });
    });

    describe("обрезка длинных строк", () => {
        it.each([
            ["обычная строка", "Hello, world!", 5, "Hello..."],
            ["строка с кириллицей", "Привет, мир!", 6, "Привет..."],
            ["строка с пробелами", "Hello World", 5, "Hello..."],
            ["длинная строка", "1234567890", 3, "123..."],
        ])("обрезает: %s", (_description, value, quantityLetter, expected) => {
            expect(cutOverflowedText(value, quantityLetter)).toBe(expected);
        });
    });

    describe("числовые значения", () => {
        it.each([
            [123, 30, "123"],
            [123456, 3, "123..."],
            [-12345, 4, "-123..."],
            [12.345, 5, "12.34..."],
        ])("преобразует число %s в строку", (value, quantityLetter, expected) => {
            expect(cutOverflowedText(value, quantityLetter)).toBe(expected);
        });
    });

    describe("значение quantityLetter", () => {
        it("использует лимит по умолчанию 30", () => {
            const value = "123456789012345678901234567890";

            expect(cutOverflowedText(value)).toBe(value);
        });

        it("возвращает пустую строку при нулевом лимите для пустого значения", () => {
            expect(cutOverflowedText("", 0)).toBe("");
        });

        it("возвращает многоточие при нулевом лимите для непустого значения", () => {
            expect(cutOverflowedText("Hello", 0)).toBe("...");
        });

        it("возвращает первоначальное значение при отрицательном лимите", () => {
            expect(cutOverflowedText("Hello", -1)).toBe("Hello");
        });

        it("обрабатывает лимит 1", () => {
            expect(cutOverflowedText("Hello", 1)).toBe("H...");
        });
    });
});
