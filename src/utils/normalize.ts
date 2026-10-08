function normalize(
    value: string | number | undefined, toLowerRegister = true
): string {

    if (value === undefined || value === null) return String(value);

    const result = String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[‐-‒–—−]/g, "-")
        .replace(/ё/gi, "е")
        .trim()

    return toLowerRegister === false ? result : result.toLowerCase();
}


function capitalize(value: string | number) {
    const stringValue = String(value);
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
}


function normalizeForSorting<T>(
    value: T | string, toLowerRegister = true
): string {

    if (value === undefined || value === null) return String(value);

    const result = String(value)
        .replace(/\u00A0/g, " ")
        .replace(/ё/gi, "е")
        .replace(/[^\p{L}\p{N}]/gu, "")
        .trim();

    return toLowerRegister === false ? result : result.toLowerCase();
}


function toNumber<T>(value: T): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(
        String(value)
            .replace(/\s/g, "")
            .replace(",", ".")
    );

    return Number.isNaN(number)
        ? null
        : number;
};


function toTimestamp<T>(value: T): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (typeof value === "number") {
        return value;
    }

    const timestamp = new Date(
        String(value)
    ).getTime();

    return Number.isNaN(timestamp)
        ? null
        : timestamp;
};


function hasValue<T>(value: T): boolean {
    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    );
};


function trimTrailingZeros(
    value: string | number | null | undefined | ""
) {
    if (value === null || value === undefined || value === '') {
        return value;
    }

    return String(value)
        .replace(/(,\d*?[1-9])0+$/, '$1')
        .replace(/,0+$/, '');
};


function cutOverflowedText(
    value: string | number | undefined,
    quantityLetter = 30
) {
    if (!value) {
        return "";
    }
    const stringValue = String(value);

    if (stringValue.length >= quantityLetter) {
        return stringValue.slice(0, quantityLetter) + "...";
    }
    else return stringValue;
}


function setDaysText(
    days: string | number | undefined
): string {

    if (!days) {
        return "";
    }

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


function formatNumber(
    value: string | number | undefined
): string {
    
    if (!value) {
        return "";
    }

    const number = Number(String(value).replace(',', '.'));

    if (isNaN(number)) {
        return "";
    }

    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
    }).format(number);
}


export {
    normalize,
    capitalize,
    normalizeForSorting,
    toNumber,
    toTimestamp,
    hasValue,
    trimTrailingZeros,
    cutOverflowedText,
    setDaysText,
    formatNumber,
};