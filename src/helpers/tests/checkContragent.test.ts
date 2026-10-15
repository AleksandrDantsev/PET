
import { describe, expect, it } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkContragent", () => {
    describe("Точное совпадение", () => {
        it.each([
            ["Ромашка", "Ромашка", true],
            ["ООО Ромашка", "ООО Ромашка", true],
            ["Альфа Трейд", "Альфа Трейд", true],
            ["Иванов Иван Иванович", "Иванов Иван Иванович", true],
            ["Ромашка", "Василек", false],
            ["Альфа", "Бета", false],
        ])("%s и %s → %s", (listName, inputName, expected) => {
            expect(check.checkContragent(listName, inputName)).toBe(expected);
        });
    });

    describe("Нормализация регистра и символов", () => {
        it("игнорирует регистр", () => {
            expect(check.checkContragent("ООО РОМАШКА", "ооо ромашка")).toBe(true);
        });

        it("считает ё и е эквивалентными", () => {
            expect(check.checkContragent("Ёлкин", "Елкин")).toBe(true);
        });

        it("нормализует знаки препинания", () => {
            expect(check.checkContragent("Ромашка, Трейд.", "Ромашка Трейд")).toBe(true);
        });

        it("игнорирует лишние пробелы", () => {
            expect(check.checkContragent("  Ромашка   Трейд  ", "Ромашка Трейд")).toBe(true);
        });
    });

    describe("Организационно-правовые формы", () => {
        it.each([
            ["ООО Ромашка", "Ромашка"],
            ["ИП Иванов", "Иванов"],
            ["АО Альфа", "Альфа"],
            ["ЗАО Вектор", "Вектор"],
            ["ПАО Горизонт", "Горизонт"],
            ["ОАО Маяк", "Маяк"],
        ])("сопоставляет %s и %s", (listName, inputName) => {
            expect(check.checkContragent(listName, inputName)).toBe(true);
        });

        it("удаляет организационно-правовую форму в середине названия", () => {
            expect(
                check.checkContragent("Ромашка ООО Трейд", "Ромашка Трейд"),
            ).toBe(true);
        });
    });

    describe("Дополнительные слова", () => {
        it("допускает дополнительные слова во входном названии", () => {
            expect(
                check.checkContragent("Ромашка Трейд", "Группа Ромашка Трейд"),
            ).toBe(true);
        });

        it("не требует совпадения всех слов входного названия", () => {
            expect(
                check.checkContragent("Альфа Трейд", "Альфа Трейд Юг"),
            ).toBe(true);
        });

        it("не считает названия одинаковыми, если слово из списка отсутствует", () => {
            expect(
                check.checkContragent("Альфа Трейд", "Альфа Север"),
            ).toBe(false);
        });

        it("не сопоставляет одно слово с двумя одинаковыми словами", () => {
            expect(
                check.checkContragent("Ромашка Ромашка", "Ромашка"),
            ).toBe(false);
        });
    });

    describe("Опечатки и похожие слова", () => {
        it("допускает одну опечатку в длинном слове", () => {
            expect(check.checkContragent("Ромашка", "Ромашки")).toBe(true);
        });

        it("допускает небольшую опечатку в длинном названии", () => {
            expect(
                check.checkContragent("Ромашка Трейд", "Ромашка Трейдд"),
            ).toBe(true);
        });

        it("cчитает короткие разные слова похожими", () => {
            expect(check.checkContragent("Альфа", "Альфы")).toBe(true);
        });

        it("не допускает слишком большое отличие в слове", () => {
            expect(check.checkContragent("Ромашка", "Березка")).toBe(false);
        });

        it("не принимает название, если одно из слов не сопоставлено", () => {
            expect(
                check.checkContragent("Ромашка Трейд", "Ромашка Компания"),
            ).toBe(false);
        });
    });

    describe("Пустые и отсутствующие значения", () => {
        it.each([
            [null, "Ромашка"],
            ["Ромашка", null],
            [undefined, "Ромашка"],
            ["Ромашка", undefined],
            ["", "Ромашка"],
            ["Ромашка", ""],
            ["   ", "Ромашка"],
            ["Ромашка", "   "],
            [null, null],
            [undefined, undefined],
        ])("возвращает false для %s и %s", (listName, inputName) => {
            expect(check.checkContragent(listName, inputName)).toBe(false);
        });
    });
});
