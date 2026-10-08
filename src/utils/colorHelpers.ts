import { normalize } from "./normalize";

const productColors = {
    "бело-желт": {
        colorName: "бело-желтый",
        color: "#f5e6a8",
    },
    "ультрамарин": {
        colorName: "ультрамарин",
        color: "#3f51b5",
    },
    "бесцветн": {
        colorName: "бесцветный",
        color: "#bfd7e2",
    },
    "коричнев": {
        colorName: "коричневый",
        color: "#795548",
    },
    "оранжев": {
        colorName: "оранжевый",
        color: "#fb8c00",
    },
    "фиолетов": {
        colorName: "фиолетовый",
        color: "#8e24aa",
    },
    "сиренев": {
        colorName: "сиреневый",
        color: "#ab47bc",
    },
    "бирюз": {
        colorName: "бирюзовый",
        color: "#00acc1",
    },
    "бежев": {
        colorName: "бежевый",
        color: "#c8ad7f",
    },
    "голуб": {
        colorName: "голубой",
        color: "#42a5f5",
    },
    "желт": {
        colorName: "желтый",
        color: "#fdd835",
    },
    "зелен": {
        colorName: "зеленый",
        color: "#43a047",
    },
    "красн": {
        colorName: "красный",
        color: "#e53935",
    },
    "розов": {
        colorName: "розовый",
        color: "#ec407a",
    },
    "син": {
        colorName: "синий",
        color: "#1e88e5",
    },
    "черн": {
        colorName: "черный",
        color: "#000000",
    },
    "бел": {
        colorName: "белый",
        color: "#ffffff",
    },
} as const;


export function getHardnessColor(
    days: string | number | undefined
): string {

    if (!days) return "black";
    
    const colors = {
        red: productColors["красн"].color,
        yellow: productColors["желт"].color,
        green: productColors["зелен"].color,
        orange: productColors["оранжев"].color,
    };

    days = Number(days);

    if (!days) return "black";

    if (!Number.isFinite(days)) {
        return "";
    }

    if (days <= 15) {
        return colors.green;
    }

    if (days <= 30) {
        return colors.yellow;
    }

    if (days <= 105) {
        return colors.orange;
    }

    return colors.red;
}

export function getProductColor(
    nomenclature: string | undefined
): string {

    if (!nomenclature) {
        return "inherit";
    }
    const normalizedText = normalize(nomenclature);
        
    return Object.entries(productColors)
        .sort(([a], [b]) => b.length - a.length)
        .find(([name]) => normalizedText.includes(name))?.[1].color ?? "";
}


export function setColorText(
    text: string | number | undefined
) {
    const normalizedText = normalize(text);

    if (
        text == "" || 
        ["любой", "нет"].includes(normalizedText)
    ) {
        return [{
            colorName: !normalizedText ? "-" : normalizedText,
            color: "inherit",
        }];
    }

    const matchedColors = Object.entries(productColors)
        .filter(([name]) => normalizedText.includes(name))
        .filter(([name], _, colors) =>
            !colors.some(([otherName]) =>
                otherName !== name &&
                otherName.length > name.length &&
                otherName.includes(name)
            )
        );

    return matchedColors.map(([, color]) => color);
}