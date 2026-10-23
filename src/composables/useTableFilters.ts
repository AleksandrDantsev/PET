import { 
    normalizeForFilter,
    toTimestamp,
    parseNumericValue,
    normalizeNumberForSearch,
} from "@/utils/normalize";
import type { 
    ColumnFilter,
    FilterType 
} from "@/pages/Interchangeable/Filters/DataTableFilter.vue";

export type TableFilterState = Record<string, ColumnFilter>;

export interface FilterColumnConfig {
    key: string;
    type: FilterType;
}

const parseNumber = (
    value: string | number | undefined,
): number | null => {
    return parseNumericValue(value);
};

const parseDate = (value: string | number | undefined): number | null => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    return toTimestamp(value) ?? null;
};

const compareCondition = (
    rawValue: string | number | undefined,
    filter: ColumnFilter,
    type: FilterType,
): boolean => {
    if (!filter.enabled || filter.value === null || filter.value === "") {
        return true;
    }
    if (type === "number" && filter.operator === "contains") {
        const actualText = normalizeNumberForSearch(rawValue);
        const expectedText = normalizeNumberForSearch(filter.value);

        return actualText.includes(expectedText);
    }

    if (type === "text") {
        const actual = normalizeForFilter(rawValue);
        const expected = normalizeForFilter(filter.value);

        switch (filter.operator) {
        case "contains":
            return actual.includes(expected);
        case "notContains":
            return !actual.includes(expected);
        case "equals":
            return actual === expected;
        case "notEquals":
            return actual !== expected;
        case "startsWith":
            return actual.startsWith(expected);
        case "endsWith":
            return actual.endsWith(expected);
        default:
            return true;
        }
    }

    const actual = type === "date"
        ? parseDate(rawValue)
        : parseNumber(rawValue);

    const first = parseNumericValue(filter.value);

    if (actual === null || first === null) {
        return false;
    }

    switch (filter.operator) {
    case "equals":
        if (type === "date") {
            return new Date(actual).toDateString()
                === new Date(first).toDateString();
        }
        return actual === first;
    case "notEquals":
        return actual !== first;
    case "greaterThan":
    case "after":
        return actual > first;
    case "lessThan":
    case "before":
        return actual < first;
    case "between": {
        const second = parseNumericValue(filter.valueTo);

        if (second === null) {
            return false;
        }

        const min = Math.min(first, second);
        const max = Math.max(first, second);

        return actual >= min && actual <= max;
    }
    default:
        return true;
    }
};

export const createDefaultFilter = (
    values: string[],
    type: FilterType = "text",
): ColumnFilter => ({
    values: [...values],
    operator: type === "number"
        ? "equals"
        : type === "date"
            ? "equals"
            : "contains",
    value: null,
    valueTo: null,
    enabled: false,
});

export const matchesTableFilters = <T extends Record<string, string | number | undefined>>(
    row: T,
    configs: FilterColumnConfig[],
    filters: TableFilterState,
    allValues: Record<string, string[]>,
    defaults: Record<string, string[]>,
): boolean => {
    return configs.every(({ key, type }) => {
        const filter = filters[key]
            ?? createDefaultFilter(defaults[key] ?? [], type);

        const selectedValues = filter.values;
        const availableValues = allValues[key] ?? [];

        if (selectedValues.length < availableValues.length) {
            if (!selectedValues.includes(String(row[key] ?? ""))) {
                return false;
            }
        }

        return compareCondition(row[key], filter, type);
    });
};