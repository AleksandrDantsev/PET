function normalize(value: string, toLowerRegister = true): string {
    if (value === undefined || value === null) return value;

    const result = String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[‐-‒–—−]/g, "-")
        .replace(/ё/gi, "е")
        .trim()

    return  toLowerRegister === false  ?  result : result.toLowerCase();
}

function normalizeForSorting(value: string, toLowerRegister = true): string {
    if (value === undefined || value === null) return value;

    const result = String(value)
        .replace(/\u00A0/g, " ")
        .replace(/ё/gi, "е")
        .replace(/[^\p{L}\p{N}]/gu, "")
        .trim();

    return  toLowerRegister === false  ?  result : result.toLowerCase();
}


export {
    normalize,
    normalizeForSorting,
}