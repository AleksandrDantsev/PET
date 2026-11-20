
import { formatCost } from "@/utils/normalize";

export const formatValue = (value: unknown): string => {
    if (value == null || String(value).trim() === "") {
        return "-";
    }

    if (typeof value === "number") {
        return formatCost(value) ?? String(value);
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

export const formatRange = (
    from: unknown,
    to: unknown,
): string => {
    const isEmpty = (value: unknown) =>
        value == null || String(value).trim() === "";

    const hasFrom = !isEmpty(from);
    const hasTo = !isEmpty(to);

    if (!hasFrom && !hasTo) return "-";
    if (!hasFrom) return `${to} гр.`;
    if (!hasTo) return `${from} гр.`;

    return `${from} – ${to} гр.`;
};

export const formatLitrazh = (value: unknown): string => {
    if (value == null || String(value).trim() === "") {
        return "-";
    }

    return `${formatValue(value)} л.`;
};
