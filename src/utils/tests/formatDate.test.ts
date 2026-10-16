
import { describe, expect, it, vi, afterEach } from "vitest";
import { formatDate } from "../normalize";

describe("formatDate", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("пустые и некорректные значения", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["NaN", NaN],
            ["Infinity", Infinity],
            ["-Infinity", -Infinity],
        ])("возвращает пустую строку для %s", (_description, value) => {
            expect(formatDate(value)).toBe("");
        });
    });

    describe("корректные timestamp", () => {
        it.each([
            ["15 января 2025", new Date(2025, 0, 15).getTime()],
            ["1 января 2025", new Date(2025, 0, 1).getTime()],
            ["31 декабря 2024", new Date(2024, 11, 31).getTime()],
            ["29 февраля 2024", new Date(2024, 1, 29).getTime()],
        ])("форматирует дату: %s", (_description, timestamp) => {
            expect(formatDate(timestamp)).toBe(
                new Date(timestamp).toLocaleDateString("ru-RU"),
            );
        });

        it("обрабатывает timestamp 0", () => {
            expect(formatDate(0)).toBe(
                new Date(0).toLocaleDateString("ru-RU"),
            );
        });

        it("обрабатывает отрицательный timestamp", () => {
            const timestamp = -86400000;

            expect(formatDate(timestamp)).toBe(
                new Date(timestamp).toLocaleDateString("ru-RU"),
            );
        });

        it("обрабатывает дробный timestamp", () => {
            const timestamp = 1736942400000.5;

            expect(formatDate(timestamp)).toBe(
                new Date(timestamp).toLocaleDateString("ru-RU"),
            );
        });
    });

    describe("границы допустимых значений", () => {
        it("возвращает пустую строку для слишком большого timestamp", () => {
            expect(formatDate(Number.MAX_VALUE)).toBe("");
        });

        it("возвращает пустую строку для слишком маленького timestamp", () => {
            expect(formatDate(-Number.MAX_VALUE)).toBe("");
        });
    });
});
