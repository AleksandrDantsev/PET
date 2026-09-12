export function setDaysText(days: string | number): string {
    days = Number(days);

    const lastTwoDigits = days % 100;
    const lastDigit = days % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return "дней";
    }

    if (lastDigit === 1) {
        return "день";
    }

    if ([2, 3, 4].includes(lastDigit)) {
        return "дня";
    }

    return "дней";
}


export function getHardnessColor(days: string | number): string {
    const colors = {
        green: '#43a047',
        yellow: '#fdd835',
        orange: '#fb8c00',
        red: '#e53935'
    };

    days = Number(days);

    if (!days) return "black";

    if (!Number.isFinite(days)) {
        return "";
    }

    if (days < 15) {
        return colors.green;
    }

    if (days < 30) {
        return colors.yellow;
    }

    if (days <= 105) {
        return colors.orange;
    }

    return colors.red;
}

export function getProductColor(nomenclature: string): string {
    if (!nomenclature) return "inherit";

    const colors = {
        'бело-желт': '#f5e6a8',
        'ультрамарин': '#3f51b5',
        'бесцветн': '#d4f1ff',
        'коричнев': '#795548',
        'оранжев': '#fb8c00',
        'фиолетов': '#8e24aa',
        'сиренев': '#ab47bc',
        'бирюз': '#00acc1',
        'бежев': '#c8ad7f',
        'голуб': '#42a5f5',
        'желт': '#fdd835',
        'зелен': '#43a047',
        'красн': '#e53935',
        'розов': '#ec407a',
        'син': '#1e88e5',
        'черн': '#000000',
        'бел': '#ffffff'
    };

    const text = String(nomenclature)
        .toLowerCase()
        .replaceAll('ё', 'е');

    for (const color in colors) {
        if (text.includes(color)) {
            return colors[color as keyof typeof colors];
        }
    }
    return "";
}

export function setColorText(text: string | number | boolean | null) {
    const colors = {
        "бело-желт": "бело-желтый",
        "ультрамарин": "ультрамарин",
        "бесцветн": "бесцветный",
        "коричнев": "коричневый",
        "оранжев": "оранжевый",
        "фиолетов": "фиолетовый",
        "сиренев": "сиреневый",
        "бирюз": "бирюзовый",
        "бежев": "бежевый",
        "голуб": "голубой",
        "желт": "желтый",
        "зелен": "зеленый",
        "красн": "красный",
        "розов": "розовый",
        "син": "синий",
        "черн": "черный",
        "бел": "белый",
    };

    const colorsNomenclature = {
        "бело-желт": "#f5e6a8",
        "ультрамарин": "#3f51b5",
        "бесцветн": "inherit",
        "коричнев": "#795548",
        "оранжев": "#fb8c00",
        "фиолетов": "#8e24aa",
        "сиренев": "#ab47bc",
        "бирюз": "#00acc1",
        "бежев": "#c8ad7f",
        "голуб": "#42a5f5",
        "желт": "#ecc826",
        "зелен": "#43a047",
        "красн": "#e53935",
        "розов": "#ec407a",
        "син": "#1e88e5",
        "черн": "#000000",
        "бел": "inherit",
    };

    const result: {
        colorName: string;
        color: string;
    }[] = [];

    if (!text) return result;

    const normalizedText = String(text).toLowerCase().trim();

    for (const color in colors) {
        if (normalizedText.includes(color)) {
            result.push({
                colorName: colors[color as keyof typeof colors],
                color: colorsNomenclature[color as keyof typeof colorsNomenclature],
            });
        }
    }

    return result;
}