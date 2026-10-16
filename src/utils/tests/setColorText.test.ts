import { describe, expect, it } from "vitest";
import { setColorText } from "../colorHelpers";

describe("setColorText", () => {
    describe("пустые и специальные значения", () => {
        it.each([
            ["undefined", undefined, "-"],
            ["пустая строка", "", "-"],
            ["любой", "любой", "любой"],
            ["Любой", "Любой", "любой"],
            ["нет", "нет", "нет"],
            ["Нет", "Нет", "нет"],
            ["строка из пробелов", "   ", "-"],
        ])("обрабатывает %s", (_description, value, colorName) => {
            expect(setColorText(value)).toEqual([
                {
                    colorName,
                    color: "inherit",
                },
            ]);
        });

        it("обрабатывает числовой ноль", () => {
            expect(setColorText(0)).toEqual([
                {
                    colorName: "-",
                    color: "inherit",
                },
            ]);
        });
    });

    describe("определение одного цвета", () => {
        it.each([
            ["бело-желтый", { colorName: "бело-желтый", color: "#f5e6a8" }],
            ["ультрамарин", { colorName: "ультрамарин", color: "#3f51b5" }],
            ["бесцветный", { colorName: "бесцветный", color: "#bfd7e2" }],
            ["коричневый", { colorName: "коричневый", color: "#795548" }],
            ["золотой", { colorName: "золотой", color: "#eedb30" }],
            ["оранжевый", { colorName: "оранжевый", color: "#fb8c00" }],
            ["фиолетовый", { colorName: "фиолетовый", color: "#8e24aa" }],
            ["сиреневый", { colorName: "сиреневый", color: "#ab47bc" }],
            ["бирюзовый", { colorName: "бирюзовый", color: "#00acc1" }],
            ["бежевый", { colorName: "бежевый", color: "#c8ad7f" }],
            ["голубой", { colorName: "голубой", color: "#42a5f5" }],
            ["желтый", { colorName: "желтый", color: "#faf60c" }],
            ["зеленый", { colorName: "зеленый", color: "#43a047" }],
            ["красный", { colorName: "красный", color: "#e53935" }],
            ["розовый", { colorName: "розовый", color: "#ec407a" }],
            ["синий", { colorName: "синий", color: "#1e88e5" }],
            ["черный", { colorName: "черный", color: "#000000" }],
            ["белый", { colorName: "белый", color: "#ffffff" }],
        ])("возвращает данные для цвета «%s»", (text, expected) => {
            expect(setColorText(text)).toEqual([expected]);
        });
    });

    describe("нормализация текста", () => {
        it.each([
            ["БЕЛЫЙ", { colorName: "белый", color: "#ffffff" }],
            ["Красный", { colorName: "красный", color: "#e53935" }],
            ["  синий  ", { colorName: "синий", color: "#1e88e5" }],
            ["ЗЕЛЁНЫЙ", { colorName: "зеленый", color: "#43a047" }],
        ])("обрабатывает «%s»", (text, expected) => {
            expect(setColorText(text)).toEqual([expected]);
        });
    });

    describe("поиск цвета внутри номенклатуры", () => {
        it.each([
            ["крышка белая", [{ colorName: "белый", color: "#ffffff" }]],
            ["колпачок красный 28 мм", [{ colorName: "красный", color: "#e53935" }]],
            ["преформа коричневая", [{ colorName: "коричневый", color: "#795548" }]],
        ])("находит цвет в «%s»", (text, expected) => {
            expect(setColorText(text)).toEqual(expected);
        });
    });

    describe("несколько цветов", () => {
        it("возвращает все совпавшие цвета в порядке productColors", () => {
            expect(setColorText("белый красный синий")).toEqual([
                { colorName: "красный", color: "#e53935" },
                { colorName: "синий", color: "#1e88e5" },
                { colorName: "белый", color: "#ffffff" },
            ]);
        });

        it("возвращает цвета для нескольких совпадений в строке", () => {
            expect(setColorText("зеленый и желтый")).toEqual([
                { colorName: "желтый", color: "#faf60c" },
                { colorName: "зеленый", color: "#43a047" },
            ]);
        });
    });

    describe("приоритет более длинных совпадений", () => {
        it("не возвращает желтый отдельно для «бело-желтый»", () => {
            expect(setColorText("бело-желтый")).toEqual([
                { colorName: "бело-желтый", color: "#f5e6a8" },
            ]);
        });

        it("не возвращает белый отдельно для «бесцветный»", () => {
            expect(setColorText("бесцветный")).toEqual([
                { colorName: "бесцветный", color: "#bfd7e2" },
            ]);
        });

        it("сохраняет независимые цвета в одной строке", () => {
            expect(setColorText("бело-желтый синий")).toEqual([
                { colorName: "бело-желтый", color: "#f5e6a8" },
                { colorName: "синий", color: "#1e88e5" },
            ]);
        });
    });

    describe("неизвестные значения", () => {
        it.each([
            "прозрачный",
            "серый",
            "серебристый",
            "натуральный",
            "без цвета",
        ])("возвращает пустой массив для «%s»", (text) => {
            expect(setColorText(text)).toEqual([]);
        });
    });

    describe("числовые значения", () => {
        it("преобразует число в строку и ищет совпадения", () => {
            expect(setColorText(123)).toEqual([]);
        });
    });
});