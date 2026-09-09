type ProductType = "крышка" | "колпачок" | "ручка" | "преформа";

interface IProductDescription {
    type: ProductType | null;
    standart: string[] | null;
    grams: number | null;
    color: string[];
    attachment: number | null;
    supplier: string | null;
    fullName: string;
}

interface IPET {
    getType(nomenclature: string | null | undefined): ProductType | null;
    getStandart(nomenclature: string | null | undefined): string[] | null;
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

        const type: ProductType | undefined = [
            "крышка",
            "колпачок",
            "ручка",
        ].find((el): el is ProductType => text.includes(el));

        return type ?? "преформа";
    },

    getStandart: function (
        nomenclature: string | null | undefined
    ): string[] | null {
        if (!nomenclature) return null;

        const productType = this.getType(nomenclature);
        const text = this.normalize(nomenclature);

        const base = ["1810", "1881", "38", "48"];
        let standarts: string[] = [];

        if (productType === "преформа") {
            standarts = ["BPF", "Oil", ...base];
        }

        if (productType === "крышка") {
            standarts = ["d=45", "5 л", "КВ-38", "КВ-5", ...base];
        }

        if (productType === "ручка") {
            standarts = ["d=28", "d=45", "РПБ-50", "SH", ...base];
        }

        if (productType === "колпачок") {
            standarts = ["1881", "28 mm"];
        }

        return standarts.filter((item) =>
            text.includes(item.toLowerCase())
        );
    },

    getGrams: function (
        nomenclature: string | null | undefined
    ): number | null {
        if (!nomenclature) return null;

        const text = String(nomenclature);

        const gramsMatch = text.match(
            /(\d+(?:[,.]\d+)?)\s*гр\b/i
        );

        if (gramsMatch) {
            return Number(
                gramsMatch[1].replace(",", ".")
            );
        }

        const matches = text.match(
            /(?<!\d)\d{2}(?!\d)/g
        );

        if (!matches) {
            return null;
        }

        const validMatches = matches.filter(
            (match) => !["38", "48"].includes(match)
        );

        return Number(
            validMatches.length
                ? validMatches[0]
                : matches[0]
        );
    },

    toNumGr: function (
        text: string | number | null | undefined
    ): number {
        if (text == null || text === "") return NaN;

        const value = Number(
            String(text)
                .trim()
                .replace(",", ".")
        );

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

        const text = String(nomenclature)
            .toLowerCase()
            .replaceAll("ё", "е");

        return colors.filter((color) =>
            text.includes(color)
        );
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
                `(?:^|[^а-яёa-z])${value}(?=$|[^а-яёa-z])`,
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
            standart: this.getStandart(nomenclature),
            grams: this.getGrams(nomenclature),
            color: this.getColor(nomenclature),
            attachment: this.getAttachment(nomenclature),
            supplier: this.getSupplier(nomenclature),
            fullName: nomenclature.trim(),
        };
    },
}

export { ih };