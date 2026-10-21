import { describe, it, expect } from "vitest";
import { check } from "../checkInterchangeablePositions";

describe("checkContragent", () => {
    it.each([
        // Полное совпадение
        ["Энергия ПАО", "Энергия ПАО", true],

        // Регистр
        ["Энергия ПАО", "энергия пао", true],
        ["ЭНЕРГИЯ ПАО", "Энергия Пао", true],

        // Лишние пробелы
        ["Энергия ПАО", "  Энергия   ПАО  ", true],

        // Ё и Е
        ["Ёлка ООО", "Елка ООО", true],

        // Пунктуация
        ["Энергия (ПАО)", "Энергия ПАО", true],

        // Допустимая опечатка
        ["Энергия ПАО", "Энергия ПАА", true],

        // Разные контрагенты
        [
            "Энергия воды СМС ЮГ (Югспецторг КТ СП)",
            "Энергия ПАО",
            false,
        ],
        ["Энергия ПАО", "Энергия ООО", false],
        ["Ромашка ООО", "Ромашка ПАО", false],

        // Существенные различия
        ["Энергия воды", "Энергия газа", false],
        ["Альфа ООО", "Бета ООО", false],

        // Пустые значения
        ["", "Энергия ПАО", false],
        ["Энергия ПАО", "", false],
        [null, "Энергия ПАО", false],
        ["Энергия ПАО", undefined, false],
    ])("%s vs %s => %s", (listName, inputName, expected) => {
        expect(
            check.checkContragent(listName, inputName)
        ).toBe(expected);
    });
});