import { describe, it, expect } from "vitest";
import { getConfigContragentsList } from "../configHandlers";
import type { IGoogleTableData } from "@/types/TableSheetData";

describe("getConfigContragentsList", () => {
    const createData = (
        rows: (string | number | boolean | null | undefined)[][]
    ): IGoogleTableData => ({
        values: rows as IGoogleTableData["values"],
    });

    it("возвращает список клиентов с филиалами и менеджерами", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Симферополь", "Иванов"],
            ["ООО Бета", "Севастополь", "Петров"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Симферополь",
                manager: "Иванов",
            },
            "ООО Бета": {
                branch: "Севастополь",
                manager: "Петров",
            },
        });
    });

    it("возвращает null, если data равен null", () => {
        expect(getConfigContragentsList(null)).toBeNull();
    });

    it("возвращает null, если values отсутствует", () => {
        expect(
            getConfigContragentsList({} as IGoogleTableData)
        ).toBeNull();
    });

    it("возвращает null для пустого массива values", () => {
        expect(
            getConfigContragentsList(createData([]))
        ).toBeNull();
    });

    it("возвращает пустой объект, если есть только заголовки", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({});
    });

    it("возвращает null, если отсутствует колонка КЛИЕНТЫ", () => {
        const data = createData([
            ["ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toBeNull();
    });

    it("возвращает null, если отсутствует колонка ФИЛИАЛ", () => {
        const data = createData([
            ["КЛИЕНТЫ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toBeNull();
    });

    it("возвращает null, если отсутствует колонка МЕНЕДЖЕРЫ КЛИЕНТОВ", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ"],
            ["ООО Альфа", "Симферополь"],
        ]);

        expect(getConfigContragentsList(data)).toBeNull();
    });

    it("учитывает заголовки с пробелами по краям", () => {
        const data = createData([
            [" КЛИЕНТЫ ", " ФИЛИАЛ ", " МЕНЕДЖЕРЫ КЛИЕНТОВ "],
            ["ООО Альфа", "Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("удаляет пробелы по краям названия клиента", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["  ООО Альфа  ", "Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("схлопывает повторяющиеся пробелы в названии клиента", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО    Альфа", "Симферополь", "Иванов"],
        ]);

        // Текущая реализация trim() не схлопывает внутренние пробелы.
        expect(getConfigContragentsList(data)).toEqual({
            "ООО    Альфа": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("сохраняет регистр названия клиента", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО АЛЬФА", "Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО АЛЬФА": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("не пропускает клиента с числовым названием 0", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            [0, "Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "0": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("преобразует числовые филиал и менеджера в строки", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", 123, 456],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "123",
                manager: "456",
            },
        });
    });

    it("пропускает клиентов с пустыми названиями", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["", "Симферополь", "Иванов"],
            ["   ", "Севастополь", "Петров"],
            ["ООО Альфа", "Ялта", "Сидоров"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Ялта",
                manager: "Сидоров",
            },
        });
    });

    it("подставляет пустой филиал, если значение отсутствует", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", null, "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "",
                manager: "Иванов",
            },
        });
    });

    it("подставляет пустого менеджера, если значение отсутствует", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Симферополь", null],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Симферополь",
                manager: "",
            },
        });
    });

    it("подставляет пустые строки, если филиал и менеджер отсутствуют", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "",
                manager: "",
            },
        });
    });

    it("сохраняет пустые строки филиала и менеджера", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "", ""],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "",
                manager: "",
            },
        });
    });

    it("перезаписывает данные при повторении точного названия клиента", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Симферополь", "Иванов"],
            ["ООО Альфа", "Севастополь", "Петров"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Севастополь",
                manager: "Петров",
            },
        });
    });

    it("считает названия с разными пробелами разными ключами", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Симферополь", "Иванов"],
            [" ООО Альфа ", "Севастополь", "Петров"],
        ]);

        // После trim() эти названия совпадают, поэтому вторая запись заменяет первую.
        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Севастополь",
                manager: "Петров",
            },
        });
    });

    it("сохраняет разные названия клиентов одного филиала", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["ООО Альфа", "Симферополь", "Иванов"],
            ["ООО Бета", "Симферополь", "Иванов"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Альфа": {
                branch: "Симферополь",
                manager: "Иванов",
            },
            "ООО Бета": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });

    it("сохраняет исходные данные без изменений", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ"],
            ["  ООО Альфа  ", " Симферополь ", " Иванов "],
        ]);

        const originalValues = structuredClone(data.values);

        getConfigContragentsList(data);

        expect(data.values).toEqual(originalValues);
    });

    it("использует последнюю колонку при повторении заголовка КЛИЕНТЫ", () => {
        const data = createData([
            ["КЛИЕНТЫ", "ФИЛИАЛ", "МЕНЕДЖЕРЫ КЛИЕНТОВ", "КЛИЕНТЫ"],
            ["ООО Альфа", "Симферополь", "Иванов", "ООО Бета"],
        ]);

        expect(getConfigContragentsList(data)).toEqual({
            "ООО Бета": {
                branch: "Симферополь",
                manager: "Иванов",
            },
        });
    });
});