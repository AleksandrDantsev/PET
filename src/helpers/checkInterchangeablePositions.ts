import { ih } from "@/helpers/interchangeableFilters";

interface IRangeGrams {
    from: string | number | null | undefined;
    to: string | number | null | undefined;
}

interface ICheckConditionsFuncs {
    checkContragent(
        listName: string | null | undefined,
        inputName: string | null | undefined
    ): boolean;

    checkType(
        listName: string | null | undefined,
        inputName: string | null | undefined
    ): boolean;

    checkStandart(
        listStandart: string | null | undefined,
        inputStandartArr: string | string[] | null | undefined
    ): boolean;

    checkIncludeColors(
        arrColors: string | string[] | null | undefined,
        arrInputColors: Array<string | null | undefined>
    ): boolean;

    checkGrams(
        objRangeGrams: IRangeGrams | null | undefined,
        inputGrams: string | number | null | undefined
    ): boolean;

    isNormalizedTextEqual(
        listText: string | null | undefined,
        inputText: string | null | undefined
    ): boolean;
}

const check: ICheckConditionsFuncs = {
    checkType: function(
        listType: string | null | undefined,
        inputType: string | null | undefined
    ): boolean {
        return ih.normalize(listType) === ih.normalize(inputType);
    },

    checkContragent: function (
        listName: string | null | undefined,
        inputName: string | null | undefined
    ): boolean {
        if (!listName?.trim() || !inputName?.trim()) {
            return false;
        }

        const normalize = (text: string): string =>
            text
                .toLowerCase()
                .replace(/ё/g, "е")
                .replace(/[()[\]{},.;:"'«»]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        const a = normalize(listName);
        const b = normalize(inputName);

        const levenshtein = (a: string, b: string): number => {
            const row = Array.from(
                { length: b.length + 1 },
                (_, i) => i
            );

            for (let i = 1; i <= a.length; i++) {
                let diagonal = row[0];
                row[0] = i;

                for (let j = 1; j <= b.length; j++) {
                    const above = row[j];

                    row[j] = Math.min(
                        row[j] + 1,
                        row[j - 1] + 1,
                        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
                    );

                    diagonal = above;
                }
            }

            return row[b.length];
        };

        const maxLength = Math.max(a.length, b.length);
        const maxDistance = maxLength <= 10
            ? 1
            : Math.floor(maxLength * 0.08);

        return levenshtein(a, b) <= maxDistance;
    },

    checkStandart: function (
        listStandart: string | null | undefined,
        inputStandartArr: string | string[] | null | undefined
    ): boolean {
        if (listStandart == null || inputStandartArr == null) {
            return false;
        }

        const excludedStandarts = ["oil", "масло", "bpf"];

        const normalizeStandart = (standard: string): string => {
            if (
                excludedStandarts.some((item) =>
                    standard.toLowerCase().includes(item)
                )
            ) {
                return standard.trim().toLowerCase();
            }

            return standard.match(/\d+(?:[.,]\d+)?/)?.[0].replace(",", ".") ?? "";
        };

        const normalizedList = normalizeStandart(listStandart);

        if (!normalizedList) {
            return false;
        }

        const standards = Array.isArray(inputStandartArr)
            ? inputStandartArr
            : [inputStandartArr];

        return standards.some((standard) => {
            const normalizedStandard = normalizeStandart(standard);

            return (
                normalizedStandard !== "" &&
                normalizedStandard === normalizedList
            );
        });
    },

    checkIncludeColors: function (
        arrColors: string | string[] | null | undefined,
        arrInputColors: Array<string | null | undefined>
    ): boolean {
        if (!Array.isArray(arrInputColors) || !arrColors) {
            return false;
        }

        const colors = (
            Array.isArray(arrColors) ? arrColors : [arrColors]
        )
            .filter(color => Boolean(color?.trim()))
            .map(color => ih.normalize(color));

        const inputs = arrInputColors
            .filter(input => Boolean(input?.trim()))
            .map(input => ih.normalize(input));

        if (!colors.length || !inputs.length) {
            return false;
        }

        const interchangeableColorGroups = [
            ["син", "голуб", "бесцветн"],
        ];

        const areColorsEquivalent = (
            a: string,
            b: string
        ): boolean => {
            if (a === b) {
                return true;
            }

            return interchangeableColorGroups.some(
                group => group.includes(a) && group.includes(b)
            );
        };

        const compositePattern = /бело[-\s]+желт/g;

        return inputs.some(input => {
            const composites = input.match(compositePattern) ?? [];

            const inputWithoutComposite = input.replace(
                compositePattern,
                " "
            );

            const inputColors = ih.getColor(inputWithoutComposite);

            const normalizedInputColors = [
                ...inputColors,
                ...composites.map(() => "бело-желт"),
            ];

            return colors.some(color => {
                if (!color) {
                    return false;
                }

                if (color === "бел-желт") {
                    return normalizedInputColors.includes("бело-желт");
                }

                if (
                    color === "бел" &&
                    normalizedInputColors.includes("бело-желт")
                ) {
                    return normalizedInputColors.some(
                        inputColor =>
                            inputColor !== "бело-желт" &&
                            inputColor === color
                    );
                }

                if (
                    color === "желт" &&
                    normalizedInputColors.includes("бело-желт")
                ) {
                    return normalizedInputColors.some(
                        inputColor =>
                            inputColor !== "бело-желт" &&
                            inputColor === color
                    );
                }

                return normalizedInputColors.some(
                    inputColor => areColorsEquivalent(color, inputColor)
                );
            });
        });
    },

    checkGrams: function (
        objRangeGrams:
            | IRangeGrams
            | null
            | undefined,
        inputGrams:
            | string
            | number
            | null
            | undefined
    ): boolean {

        if (
            objRangeGrams?.from == null ||
            objRangeGrams?.to == null ||
            inputGrams == null
        ) {
            return false;
        }

        const from = ih.toNumGr(
            objRangeGrams.from
        );

        const to = ih.toNumGr(
            objRangeGrams.to
        );

        const grams = ih.toNumGr(inputGrams);

        if (
            !Number.isFinite(from) ||
            !Number.isFinite(to) ||
            !Number.isFinite(grams)
        ) {
            return false;
        }

        return grams >= from && grams <= to;
    },

    isNormalizedTextEqual: function (
        listText: string | null | undefined,
        inputText: string | null | undefined
    ): boolean {
        if (
            listText == null ||
            inputText == null
        ) {
            return false;
        }

        const list = ih.normalize(listText);
        const input = ih.normalize(inputText);

        if (!list || !input) {
            return false;
        }

        return list === input;
    },
};

export { check };