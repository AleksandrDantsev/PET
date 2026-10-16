import { describe, expect, it } from "vitest";
import { toTimestamp } from "../normalize";

describe("toTimestamp", () => {
    describe("пустые значения", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["пустая строка", ""],
        ])("возвращает null для %s", (_description, value) => {
            expect(toTimestamp(value)).toBeNull();
        });
    });

    describe("числовые значения", () => {
        it.each([
            ["положительный timestamp", 1767225600000],
            ["нулевой timestamp", 0],
            ["отрицательный timestamp", -1000],
            ["дробное число", 1234.5],
        ])("возвращает число без изменений: %s", (_description, value) => {
            expect(toTimestamp(value)).toBe(value);
        });

        it("возвращает NaN без изменений", () => {
            expect(toTimestamp(NaN)).toBeNaN();
        });

        it("возвращает Infinity без изменений", () => {
            expect(toTimestamp(Infinity)).toBe(Infinity);
        });
    });

    describe("даты в формате ДД.ММ.ГГГГ", () => {
        it.each([
            ["01.01.2025", 2025, 0, 1],
            ["31.12.2024", 2024, 11, 31],
            ["15.06.2026", 2026, 5, 15],
            ["29.02.2024", 2024, 1, 29],
        ])("преобразует %s в timestamp", (input, year, month, day) => {
            expect(toTimestamp(input)).toBe(
                new Date(year, month, day).getTime(),
            );
        });

        it("нормализует несуществующую календарную дату", () => {
            expect(toTimestamp("31.04.2025")).toBe(
                new Date(2025, 3, 31).getTime(),
            );
        });

        it("нормализует день за пределами месяца", () => {
            expect(toTimestamp("32.01.2025")).toBe(
                new Date(2025, 0, 32).getTime(),
            );
        });

        it("нормализует месяц за пределами года", () => {
            expect(toTimestamp("15.13.2025")).toBe(
                new Date(2025, 12, 15).getTime(),
            );
        });
    });

    describe("даты в других форматах", () => {
        it.each([
            ["ISO date", "2025-01-15"],
            ["ISO datetime", "2025-01-15T12:30:00Z"],
            ["дата со временем", "January 15, 2025"],
            ["дата со слешами", "2025/01/15"],
        ])("обрабатывает %s", (_description, input) => {
            expect(toTimestamp(input)).toBe(
                new Date(input).getTime(),
            );
        });
    });

    describe("некорректные значения", () => {
        it.each([
            ["текст", "не дата"],
            ["строка из пробелов", "   "],
            ["несуществующая дата в другом формате", "not-a-date"],
        ])("возвращает null для значения: %s", (_description, input) => {
            expect(toTimestamp(input)).toBeNull();
        });
    });

    describe("прочие типы", () => {
        it("возвращает null для boolean true", () => {
            expect(toTimestamp(true)).toBeNull();
        });

        it("возвращает null для boolean false", () => {
            expect(toTimestamp(false)).toBeNull();
        });

        it("возвращает null для объекта", () => {
            expect(toTimestamp({ value: "2025-01-15" })).toBeNull();
        });

        it("обрабатывает массив по его строковому представлению", () => {
            expect(toTimestamp([2025, 1, 15])).toBe(
                new Date("2025,1,15").getTime(),
            );
        });
    });
});