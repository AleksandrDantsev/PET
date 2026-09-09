import { ih } from "@/helpers/interchangeableFilters";

interface IRangeGrams {
    from: string | number | null | undefined;
    to: string | number | null | undefined;
}

interface IBestMatch {
    index: number;
    similarity: number;
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
        if (!listName || !inputName) {
            return false;
        }

        const normalize = (text: string): string =>
            String(text)
                .toLowerCase()
                .replace(/ё/g, "е")
                .replace(/[()[\]{},.;:"'«»]/g, " ")
                .replace(/\b(ип|ооо|ао|зао|пао|оао)\b/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        const getWords = (text: string): string[] =>
            normalize(text)
                .split(" ")
                .filter(Boolean);

        const levenshtein = (a: string, b: string): number => {
            if (a === b) return 0;

            if (!a.length) return b.length;
            if (!b.length) return a.length;

            let prev = Array.from(
                { length: b.length + 1 },
                (_, i) => i
            );

            for (let i = 1; i <= a.length; i++) {
                const curr: number[] = [i];

                for (let j = 1; j <= b.length; j++) {
                    const cost =
                        a[i - 1] === b[j - 1]
                            ? 0
                            : 1;

                    curr[j] = Math.min(
                        curr[j - 1] + 1,
                        prev[j] + 1,
                        prev[j - 1] + cost
                    );
                }

                prev = curr;
            }

            return prev[b.length];
        };

        const getWordSimilarity = (
            a: string,
            b: string
        ): number => {
            if (a === b) {
                return 1;
            }

            const maxLength = Math.max(
                a.length,
                b.length
            );

            if (maxLength < 5) {
                return 0;
            }

            const distance = levenshtein(a, b);

            const similarity =
                1 - distance / maxLength;

            if (maxLength <= 6) {
                return distance <= 1
                    ? similarity
                    : 0;
            }

            if (maxLength <= 10) {
                return distance <= 2
                    ? similarity
                    : 0;
            }

            return distance <= 2
                ? similarity
                : 0;
        };

        const listWords = getWords(listName);
        const inputWords = getWords(inputName);

        if (!listWords.length || !inputWords.length) {
            return false;
        }

        const normalizedList = normalize(listName);
        const normalizedInput = normalize(inputName);

        if (normalizedList === normalizedInput) {
            return true;
        }

        if (normalizedInput.includes(normalizedList)) {
            return true;
        }

        let matchedCount = 0;
        let totalSimilarity = 0;

        const usedInputIndexes = new Set<number>();

        for (const listWord of listWords) {
            let bestMatch: IBestMatch | null = null;

            for (let i = 0; i < inputWords.length; i++) {
                if (usedInputIndexes.has(i)) {
                    continue;
                }

                const inputWord = inputWords[i];

                const similarity =
                    getWordSimilarity(
                        listWord,
                        inputWord
                    );

                if (
                    similarity > 0 &&
                    (
                        !bestMatch ||
                        similarity > bestMatch.similarity
                    )
                ) {
                    bestMatch = {
                        index: i,
                        similarity,
                    };
                }
            }

            if (bestMatch) {
                matchedCount++;
                totalSimilarity += bestMatch.similarity;

                usedInputIndexes.add(
                    bestMatch.index
                );
            }
        }

        const coverage =
            matchedCount / listWords.length;

        if (coverage < 1) {
            return false;
        }

        const averageSimilarity =
            totalSimilarity / matchedCount;

        return averageSimilarity >= 0.8;
    },

    checkStandart: function (
        listStandart: string | null | undefined,
        inputStandartArr:
            | string
            | string[]
            | null
            | undefined
    ): boolean {
        if (
            listStandart == null ||
            inputStandartArr == null
        ) {
            return false;
        }

        const standards = Array.isArray(inputStandartArr)
            ? inputStandartArr
            : [inputStandartArr];

        const normalizedList =
            ih.normalize(listStandart);

        if (!normalizedList) {
            return false;
        }

        return standards.some((elem) => {
            const normalizedElem =
                ih.normalize(elem);

            return (
                normalizedElem &&
                normalizedList.includes(normalizedElem)
            );
        });
    },

    checkIncludeColors: function (
        arrColors:
            | string
            | string[]
            | null
            | undefined,
        arrInputColors:
            Array<string | null | undefined>
    ): boolean {
        if (!arrInputColors) {
            return false;
        }

        const colors = (
            Array.isArray(arrColors)
                ? arrColors
                : [arrColors]
        ).filter(Boolean) as string[];

        const inputColors =
            arrInputColors.filter(Boolean) as string[];

        return inputColors.some((inputColor) => {
            const normalizedInput =
                ih.normalize(inputColor);

            if (!normalizedInput) {
                return false;
            }

            return colors.some((color) => {
                const normalizedColor =
                    ih.normalize(color);

                return (
                    normalizedColor &&
                    normalizedInput.includes(
                        normalizedColor
                    )
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