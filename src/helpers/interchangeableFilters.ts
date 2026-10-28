type ProductType = "крышка" | "колпачок" | "ручка" | "преформа";

interface IProductDescription {
    type: ProductType | null;
    standard: string[] | null;
    grams: number | null;
    color: string[];
    attachment: number | null;
    supplier: string | null;
    fullName: string;
}

interface IPET {
    getType(nomenclature: string | null | undefined): ProductType | null;
    getStandard(nomenclature: string | null | undefined): string[] | null;
    getGrams(nomenclature: string | null | undefined): number | null;
    toNumGr(text: string | number | null | undefined): number;
    getColor(nomenclature: string | null | undefined): string[];
    getAttachment(nomenclature: string | null | undefined): number | null;
    getSupplier(nomenclature: string | null | undefined): string | null;
    normalize(text: unknown): string;
    getDescriptionProduct(
        nomenclature: string | null | undefined
    ): IProductDescription | null;
}

const ih: IPET = {
    getType: function (
        nomenclature: string | null | undefined
    ): ProductType | null {
        if (!nomenclature) return null;

        const text = this.normalize(nomenclature);

        if (text.includes("пробка")) return "крышка";

        const type: ProductType | undefined = [
            "крышка",
            "колпачок",
            "ручка",
        ].find((el): el is ProductType => text.includes(el));

        return type ?? "преформа";
    },

    getStandard: function (
        nomenclature: string | null | undefined
    ): string[] | null {
        if (!nomenclature) return null;

        const productType = this.getType(nomenclature);
        const text = this.normalize(nomenclature);

        const base = ["1810", "1881", "38", "48", "Oil", "Масло"];

        const standard28 = ["d=28", "28 мм", "28мм", "28 mm", "28mm"];
        const standard45 = ["d=45", "45 мм", "45мм", "45 mm", "45mm"];

        let standards: string[] = [];

        if (productType === "преформа") {
            standards = ["BPF", ...base];
        }

        if (productType === "крышка") {
            standards = ["КВ-50", ...standard28, ...standard45, ...base];
        }

        if (productType === "ручка") {
            standards = ["РПБ-50", ...standard28, ...standard45, ...base];
        }

        if (productType === "колпачок") {
            standards = ["1881", "28 mm"];
        }

        const found = standards.filter((item) => {
            const standard = item.toLowerCase();

            if (/^\d+$/.test(standard)) {
                return new RegExp(
                    `(?<!\\d)${standard}(?!\\d)`
                ).test(text);
            }

            return text.includes(standard);
        });

        if (found.some((item) => (item.includes("45") || item.includes("50"))) 
                && !found.includes("48")) {
            found.push("48");
        }
        if (found.some((item) => item.includes("Масло"))
                && !found.includes("oil")) {
            found.push("oil");
        }
        return [...new Set(found)];
    },

    getGrams: function (
        nomenclature: string | null | undefined
    ): number | null {
        if (!nomenclature?.trim()) return null;

        const gramsMatch = nomenclature.match(
            /(?<![\d.,])(\d+(?:[,.]\d+)?)\s*гр\.?(?!\p{L})/iu
        );

        if (!gramsMatch) return null;

        const grams = Number(
            gramsMatch[1].replace(",", ".")
        );

        return Number.isFinite(grams) ? grams : null;
    },


    toNumGr: function (
        text: string | number | null | undefined
    ): number {
        if (text == null || text === "") return NaN;

        const normalized = String(text)
            .trim()
            .replace(",", ".");

        if (!normalized) return NaN;

        const value = Number(normalized);

        return Number.isFinite(value) ? value : NaN;
    },

    getColor: function (
        nomenclature: string | null | undefined
    ): string[] {
        if (!nomenclature) return [];

        const colors = [
            "бежев",
            "бело-желт",
            "бел",
            "бесцветн",
            "голуб",
            "желт",
            "зелен",
            "коричнев",
            "золот",
            "красн",
            "оранжев",
            "розов",
            "син",
            "сиренев",
            "ультрамарин",
            "фиолетов",
            "черн",
            "бирюз",
        ];

        const text = nomenclature
            .toLowerCase()
            .replaceAll("ё", "е");

        const found = colors.filter((color) =>
            text.includes(color)
        );

        if (found.includes("бело-желт")) {
            return found.filter((color) => {
                if (color === "бел") return false;

                if (color === "желт") {
                    return /(?<![а-я])желт/.test(text.replace(/бело-желт/g, ""));
                }

                return true;
            });
        }

        return found;
    },

    getAttachment: function (
        nomenclature: string | null | undefined
    ): number | null {
        if (!nomenclature) return null;

        const matches = String(nomenclature).match(
            /\((\d+)\)/g
        );
        if (!matches) {
            return null;
        }
        const lastMatch = matches.at(-1);

        if (!lastMatch) {
            return null;
        }
        const number = lastMatch.match(/\d+/);

        return number ? Number(number[0]) : null;
    },

    getSupplier: function (
        nomenclature: string | null | undefined
    ): string | null {
        if (!nomenclature) return null;

        const suppliers = [
            "АТФ", "ЕПМ", "ЕП", "ОП", "ПФ", "ТП",
            "ВП", "ВЕ", "ПП", "РП", "Р", "ЮП",
            "УП", "УПР", "ЕК", "КТ", "ПР", "СК",
            "ЕПБ", "НП", "ПТ", "Пл", "БФ", "БГА",
            "КВ", "ИСП", "АП", "BRC", "Resilux",
        ].sort((a, b) => b.length - a.length);

        const text = String(nomenclature).toLowerCase();

        return suppliers.find((supplier) => {
            const value = supplier.toLowerCase();

            return new RegExp(
                `(?:^|[^а-яёa-z0-9])${value}(?=$|[^а-яёa-z0-9])`,
                "i"
            ).test(text);
        }) ?? null;
    },

    normalize: function (text: unknown): string {
        return String(text ?? "")
            .toLowerCase()
            .replace(/ё/g, "е")
            .replace(/[()[\]{},.;:"'«»]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    },

    getDescriptionProduct: function (
        nomenclature: string | null | undefined
    ): IProductDescription | null {
        if (!nomenclature) return null;

        return {
            type: this.getType(nomenclature),
            standard: this.getStandard(nomenclature),
            grams: this.getGrams(nomenclature),
            color: this.getColor(nomenclature),
            attachment: this.getAttachment(nomenclature),
            supplier: this.getSupplier(nomenclature),
            fullName: nomenclature.trim(),
        };
    },
}

export { ih };