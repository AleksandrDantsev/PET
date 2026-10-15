import { describe, expect, it } from "vitest";
import { ih } from "../interchangeableFilters";

describe("getAttachment", () => {
    describe("Извлечение числа из скобок", () => {
        it.each([
            ["Крышка белая 1810 (28 мм) (5000) КТ", 5000],
            ["12 гр. 1881 бесцветная (21120) ЕПМ", 21120],
            ["22,5 гр. Oil бесцветная (13776) ЕП", 13776],
            ["Крышка белая - КВ-50 БФ (1300) ЕК", 1300],
            ["Ручка синяя - РПБ-50 (650) ЕК", 650],
            ["Ручка синяя(УСИЛ.) - РПБ-50 (600) ЕК", 600],
            ["Пробка 28 бело-желтый (4500) РП", 4500],
        ])("%s → %i", (input, expected) => {
            expect(ih.getAttachment(input)).toBe(expected);
        });
    });

    describe("Несколько чисел в скобках", () => {
        it("возвращает число из последних скобок", () => {
            expect(
                ih.getAttachment("Крышка (100) (200)"),
            ).toBe(200);
        });

        it("игнорирует числа в скобках без цифр", () => {
            expect(
                ih.getAttachment("Крышка (тест) (300)"),
            ).toBe(300);
        });

        it("возвращает число из скобок, если последние скобки не содержат числа", () => {
            expect(
                ih.getAttachment("Крышка (300) (тест)"),
            ).toBe(300);
        });

        it("извлекает число из последних скобок, даже если раньше есть другие числа", () => {
            expect(
                ih.getAttachment("Крышка 1810 (28 мм) (5000) КТ"),
            ).toBe(5000);
        });
    });

    describe("Пустые и некорректные значения", () => {
        it.each([null, undefined, ""])(
            "возвращает null для %s",
            (input) => {
                expect(ih.getAttachment(input)).toBeNull();
            },
        );

        it.each([
            "Крышка белая 1810",
            "Крышка без вложения",
            "Крышка (тест)",
            "Крышка ()",
        ])("возвращает null, если нет числа в скобках: %s", (input) => {
            expect(ih.getAttachment(input)).toBeNull();
        });
    });

    describe("Формат числа", () => {
        it("возвращает число, а не строку", () => {
            const result = ih.getAttachment("Крышка (5000)");

            expect(result).toBe(5000);
            expect(typeof result).toBe("number");
        });

        it("корректно обрабатывает ноль", () => {
            expect(ih.getAttachment("Крышка (0)")).toBe(0);
        });

        it("корректно обрабатывает число с ведущими нулями", () => {
            expect(ih.getAttachment("Крышка (00500)")).toBe(500);
        });
    });
});
