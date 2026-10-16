
import { describe, expect, it, vi, afterEach } from "vitest";
import { ih } from "../interchangeableFilters";

describe("getDescriptionProduct", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Пустые значения", () => {
        it.each([null, undefined, ""])(
            "возвращает null для %s",
            (nomenclature) => {
                expect(
                    ih.getDescriptionProduct(nomenclature),
                ).toBeNull();
            },
        );
    });

    it("возвращает описание товара со всеми характеристиками", () => {
        const result = ih.getDescriptionProduct(
            "Преформа 22,5 гр. Oil бесцветная (13776) ЕП",
        );

        expect(result).toEqual({
            type: ih.getType("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            standart: ih.getStandart("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            grams: ih.getGrams("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            color: ih.getColor("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            attachment: ih.getAttachment("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            supplier: ih.getSupplier("Преформа 22,5 гр. Oil бесцветная (13776) ЕП"),
            fullName: "Преформа 22,5 гр. Oil бесцветная (13776) ЕП",
        });
    });

    it("обрезает пробелы по краям fullName", () => {
        const result = ih.getDescriptionProduct(
            "  Крышка белая КВ-50  ",
        );

        expect(result?.fullName).toBe("Крышка белая КВ-50");
    });

    it("сохраняет исходное название с внутренними пробелами", () => {
        const result = ih.getDescriptionProduct(
            "Крышка   белая   КВ-50",
        );

        expect(result?.fullName).toBe("Крышка   белая   КВ-50");
    });

    it("возвращает null в type, если getType не определяет тип товара", () => {
        vi.spyOn(ih, "getType").mockReturnValue(null);

        const result = ih.getDescriptionProduct(
            "Неизвестный товар",
        );

        expect(result).not.toBeNull();
        expect(result?.type).toBeNull();
    });

    it("не изменяет исходную строку номенклатуры", () => {
        const nomenclature = "  Крышка белая КВ-50  ";

        ih.getDescriptionProduct(nomenclature);

        expect(nomenclature).toBe("  Крышка белая КВ-50  ");
    });
});
