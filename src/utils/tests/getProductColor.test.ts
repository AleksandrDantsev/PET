import { describe, expect, it } from "vitest";
import { getProductColor } from "../colorHelpers";

describe("getProductColor", () => {
    describe("пустые значения", () => {
        it.each([
            ["undefined", undefined],
            ["пустая строка", ""],
        ])("возвращает inherit для %s", (_description, value) => {
            expect(getProductColor(value)).toBe("inherit");
        });
    });

    describe("определение цветов", () => {
        it.each([
            ["бело-желтый", "#f5e6a8"],
            ["бело-желтая крышка", "#f5e6a8"],
            ["ультрамарин", "#3f51b5"],
            ["бесцветный", "#bfd7e2"],
            ["коричневый", "#795548"],
            ["золотой", "#eedb30"],
            ["оранжевый", "#fb8c00"],
            ["фиолетовый", "#8e24aa"],
            ["сиреневый", "#ab47bc"],
            ["бирюзовый", "#00acc1"],
            ["бежевый", "#c8ad7f"],
            ["голубой", "#42a5f5"],
            ["желтый", "#faf60c"],
            ["зеленый", "#43a047"],
            ["красный", "#e53935"],
            ["розовый", "#ec407a"],
            ["синий", "#1e88e5"],
            ["черный", "#000000"],
            ["белый", "#ffffff"],
        ])("определяет цвет для «%s»", (nomenclature, expected) => {
            expect(getProductColor(nomenclature)).toBe(expected);
        });
    });

    describe("поиск по части названия цвета", () => {
        it.each([
            ["бело-желт", "#f5e6a8"],
            ["коричнев", "#795548"],
            ["оранжев", "#fb8c00"],
            ["бирюз", "#00acc1"],
            ["голуб", "#42a5f5"],
            ["зелен", "#43a047"],
            ["красн", "#e53935"],
            ["розов", "#ec407a"],
            ["черн", "#000000"],
        ])("определяет цвет по фрагменту «%s»", (nomenclature, expected) => {
            expect(getProductColor(nomenclature)).toBe(expected);
        });
    });

    describe("нормализация регистра", () => {
        it.each([
            ["БЕЛЫЙ", "#ffffff"],
            ["Белый", "#ffffff"],
            ["КРАСНЫЙ", "#e53935"],
            ["Зелёный", "#43a047"],
            ["ЁЛОЧНЫЙ БЕЛЫЙ", "#ffffff"],
        ])("обрабатывает значение «%s»", (nomenclature, expected) => {
            expect(getProductColor(nomenclature)).toBe(expected);
        });
    });

    describe("название цвета внутри номенклатуры", () => {
        it.each([
            ["Крышка белая", "#ffffff"],
            ["Преформа коричневая 28 мм", "#795548"],
            ["Колпачок синий 1810", "#1e88e5"],
            ["Бутылка прозрачная бесцветная", "#bfd7e2"],
            ["Изделие оранжевого цвета", "#fb8c00"],
        ])("находит цвет в строке «%s»", (nomenclature, expected) => {
            expect(getProductColor(nomenclature)).toBe(expected);
        });
    });

    describe("приоритет более длинного совпадения", () => {
        it("выбирает бело-желтый вместо желтого", () => {
            expect(getProductColor("бело-желтый")).toBe("#f5e6a8");
        });

        it("выбирает голубой вместо синего", () => {
            expect(getProductColor("голубой")).toBe("#42a5f5");
        });

        it("выбирает бесцветный вместо белого, если оба фрагмента присутствуют", () => {
            expect(getProductColor("бесцветный белый")).toBe("#bfd7e2");
        });
    });

    describe("неизвестные цвета", () => {
        it.each([
            "прозрачный",
            "серый",
            "серебристый",
            "натуральный",
            "без указания цвета",
        ])("возвращает пустую строку для «%s»", (nomenclature) => {
            expect(getProductColor(nomenclature)).toBe("");
        });
    });

    describe("пробелы и дополнительные символы", () => {
        it("обрабатывает пробелы в начале и конце", () => {
            expect(getProductColor("  белый  ")).toBe("#ffffff");
        });

        it("находит цвет при наличии нескольких слов", () => {
            expect(getProductColor("крышка для бутылки красная")).toBe("#e53935");
        });

        it("возвращает inherit для строки из пробелов", () => {
            expect(getProductColor("   ")).toBe("");
        });
    });
});