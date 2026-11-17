
import { computed, ref } from "vue";
import type { DataObject } from "@/types/TableSheetData.ts";
import {
    normalizeForFilter,
    toTimestamp,
    parseNumericValue,
    normalizeNumberForSearch,
} from "@/utils/normalize";
import {
    CONST_TITLES,
} from "@/configs/CONFIG_CONST.ts";
import type {
    ColumnFilter,
    FilterType,
} from "@/pages/Interchangeable/Filters/DataTableFilter.vue";

export type TableFilterState = Record<string, ColumnFilter>;

export interface FilterColumnConfig {
    key: string;
    type: FilterType;
}

export interface FilterOption {
    label: string;
    value: string;
}

const FILTER_CONFIGS: FilterColumnConfig[] = [
    { key: CONST_TITLES.ONE_C_NOMENCLATURE, type: "text" },
    { key: CONST_TITLES.RESPONSIBLE_MANAGER, type: "text" },
    { key: CONST_TITLES.BRANCH, type: "text" },
    { key: CONST_TITLES.CURRENT_CLIENT, type: "text" },
    { key: CONST_TITLES.UNDERSOLDED_COST, type: "number" },
    { key: CONST_TITLES.DELIVERY_DATE, type: "date" },
    { key: CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP, type: "text" },
    { key: CONST_TITLES.REMAINDER_BOXES_1C, type: "number" },
    { key: CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW, type: "number" },
    { key: CONST_TITLES.DATE_NEXT_ACTION, type: "date" },
];

const parseNumber = (
    value: string | number | undefined,
): number | null => {
    return parseNumericValue(value);
};

const parseDate = (
    value: string | number | undefined,
): number | null => {
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

export const matchesTableFilters = <
    T extends Record<string, string | number | undefined>
    >(
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

export const useTableFilters = (
    getTableData: () => DataObject[],
    getFilteredData: () => DataObject[],
) => {
    const filterConfigs = FILTER_CONFIGS;

    const tableFilters = ref<TableFilterState>({});

    const getUniqueValues = (key: string): FilterOption[] => {
        return [
            ...new Set(
                getTableData()
                    .map(row => row[key])
                    .filter(value =>
                        value !== null &&
                        value !== undefined &&
                        value !== "",
                    )
                    .map(value => String(value)),
            ),
        ]
            .sort((a, b) => {
                const normalize = (value: string) =>
                    value.replace(/[^\p{L}\p{N}\s]/gu, "");

                return normalize(a).localeCompare(
                    normalize(b),
                    "ru",
                    { numeric: true },
                );
            })
            .map(value => ({
                label: value,
                value,
            }));
    };

    const allFilterValues = computed<Record<string, string[]>>(() => {
        const result: Record<string, string[]> = {};

        for (const { key } of filterConfigs) {
            result[key] = getUniqueValues(key).map(option => option.value);
        }

        return result;
    });

    const filterDefaults = computed<Record<string, string[]>>(() => {
        const result: Record<string, string[]> = {};

        for (const { key } of filterConfigs) {
            result[key] = (allFilterValues.value[key] ?? []).filter(
                value =>
                    key !== CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP ||
                    !value.startsWith("0 в реал"),
            );
        }

        return result;
    });

    const getTableFilter = (key: string): ColumnFilter => {
        const config = filterConfigs.find(item => item.key === key);

        return tableFilters.value[key]
            ?? createDefaultFilter(
                filterDefaults.value[key] ?? [],
                config?.type ?? "text",
            );
    };

    const updateTableFilter = (
        key: string,
        value: ColumnFilter,
    ) => {
        tableFilters.value = {
            ...tableFilters.value,
            [key]: value,
        };
    };

    const filteredData = computed(() => {
        return getFilteredData().filter(row =>
            matchesTableFilters(
                row,
                filterConfigs,
                tableFilters.value,
                allFilterValues.value,
                filterDefaults.value,
            ),
        );
    });

    return {
        filterConfigs,
        tableFilters,
        allFilterValues,
        filterDefaults,
        getUniqueValues,
        getTableFilter,
        updateTableFilter,
        filteredData,
    };
};
