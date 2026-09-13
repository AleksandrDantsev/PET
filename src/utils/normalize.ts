function normalize(value: string, toLowerRegister = true): string {
    if (value === undefined || value === null) return value;

    const result = String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[‐-‒–—−]/g, "-")
        .replace(/ё/gi, "е")
        .trim()

    return toLowerRegister === false ? result : result.toLowerCase();
}

function normalizeForSorting<T>(value: T | string, toLowerRegister = true): string {
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



export {
    normalize,
    normalizeForSorting,
    toNumber,
    toTimestamp,
    hasValue,
}