<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import {
    NButton,
    NCheckbox,
    NDatePicker,
    NInput,
    NInputNumber,
    NPopover,
    NSelect,
    NSpace,
} from "naive-ui";
import { 
    cutOverflowedText,
    normalizeForFilter,
    parseNumericValue,
} from "@/utils/normalize";

export type FilterType = "text" | "number" | "date";

export type FilterOperator =
    | "contains"
    | "notContains"
    | "equals"
    | "notEquals"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "between"
    | "before"
    | "after";

export interface ColumnFilter {
    values: string[];
    operator: FilterOperator;
    value: string | number | null;
    valueTo: string | number | null;
    enabled: boolean;
}

interface FilterOption {
    label: string;
    value: string;
}

const props = withDefaults(defineProps<{
    title: string;
    options: FilterOption[];
    defaultValues?: string[];
    type?: FilterType;
    modelValue: ColumnFilter;
}>(), {
    type: "text",
    defaultValues: () => [],
});

const emit = defineEmits<{
    "update:modelValue": [value: ColumnFilter];
    apply: [];
}>();

const open = ref(false);
const search = ref("");
const debouncedSearch = ref("");

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

watch(search, (value) => {
    if (searchTimeout !== undefined) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        debouncedSearch.value = normalizeForFilter(value);
        searchTimeout = undefined;
    }, 400);
});

onBeforeUnmount(() => {
    if (searchTimeout !== undefined) {
        clearTimeout(searchTimeout);
    }
});

const cloneFilter = (filter: ColumnFilter): ColumnFilter => ({
    ...filter,
    values: [...filter.values],
});

const draft = ref<ColumnFilter>(cloneFilter(props.modelValue));

watch(
    () => props.modelValue,
    value => {
        draft.value = cloneFilter(value);
    },
);

const selectedValues = computed(() => new Set(draft.value.values));

const defaultOperator = (): FilterOperator => {
    if (props.type === "number") return "equals";
    if (props.type === "date") return "before";
    return "contains";
};

const operators = computed(() => {
    if (props.type === "number") {
        return [
            { label: "Содержит", value: "contains" },
            { label: "Равно", value: "equals" },
            { label: "Не равно", value: "notEquals" },
            { label: "Больше", value: "greaterThan" },
            { label: "Меньше", value: "lessThan" },
            { label: "Между", value: "between" },
        ];
    }

    if (props.type === "date") {
        return [
            { label: "Равно", value: "equals" },
            { label: "До даты", value: "before" },
            { label: "После даты", value: "after" },
            { label: "Между датами", value: "between" },
        ];
    }

    return [
        { label: "Содержит", value: "contains" },
        { label: "Не содержит", value: "notContains" },
        { label: "Равно", value: "equals" },
        { label: "Не равно", value: "notEquals" },
        { label: "Начинается с", value: "startsWith" },
        { label: "Заканчивается на", value: "endsWith" },
    ];
});

const normalizeOptionSearch = (value: string): string =>
    value
        .replace(/[\u00A0\u202F\s]/g, "")
        .toLocaleLowerCase("ru");

const normalizedOptions = computed(() => {
    const uniqueOptions = new Map<
        string,
        {
            label: string;
            value: string;
            normalizedLabel: string;
            displayLabel: string;
            numericValue: number | null;
        }
    >();

    for (const option of props.options) {
        const normalizedLabel = normalizeOptionSearch(option.label);

        if (!uniqueOptions.has(normalizedLabel)) {
            uniqueOptions.set(normalizedLabel, {
                label: option.label,
                value: option.value,
                normalizedLabel,
                displayLabel: String(cutOverflowedText(option.label, 20)),
                numericValue: null,
            });
        }
    }

    return [...uniqueOptions.values()].sort((a, b) => {
        if (props.type === "number") {
            const numA = parseNumericValue(a.label);
            const numB = parseNumericValue(b.label);

            if (numA !== null && numB !== null) {
                return numA - numB;
            }

            if (numA !== null) return -1;
            if (numB !== null) return 1;
        }

        return a.label.localeCompare(b.label, "ru", {
            sensitivity: "base",
            numeric: true,
        });
    });
});

const filteredOptions = computed(() => {
    const query = debouncedSearch.value;

    if (!query) {
        return normalizedOptions.value;
    }

    return normalizedOptions.value.filter(option =>
        option.normalizedLabel.includes(query),
    );
});


const allSelected = computed(() =>
    filteredOptions.value.length > 0 &&
    filteredOptions.value.every(option =>
        selectedValues.value.has(option.value),
    ),
);

const someSelected = computed(() =>
    filteredOptions.value.some(option =>
        selectedValues.value.has(option.value),
    ),
);

const toggleValue = (value: string, checked: boolean) => {
    const values = new Set(draft.value.values);

    if (checked) {
        values.add(value);
    } else {
        values.delete(value);
    }

    draft.value.values = [...values];
};

const toggleAll = (checked: boolean) => {
    const values = new Set(draft.value.values);

    for (const option of filteredOptions.value) {
        if (checked) {
            values.add(option.value);
        } else {
            values.delete(option.value);
        }
    }

    draft.value.values = [...values];
};

const updateOperator = (operator: FilterOperator) => {
    draft.value.operator = operator;
};

const commit = () => {
    emit("update:modelValue", cloneFilter(draft.value));
    emit("apply");
    open.value = false;
};

const reset = () => {
    draft.value = {
        values: [...props.defaultValues],
        operator: defaultOperator(),
        value: null,
        valueTo: null,
        enabled: false,
    };

    search.value = "";
    debouncedSearch.value = "";
    commit();
};

const filterCounter = computed(() => ({
    selected: selectedValues.value.size,
    total: new Set(
        normalizedOptions.value.map(option =>
            normalizeOptionSearch(option.label),
        ),
    ).size,
}));

const isFilterApplied = computed(() => {
    const filter = props.modelValue;

    const hasSelectedValues =
        filter.values.length > 0 &&
        filter.values.length < props.options.length;

    const hasCondition =
        filter.enabled &&
        filter.value !== null &&
        filter.value !== "";

    return hasSelectedValues || hasCondition;
});

</script>


<template>
    <div class="column-filter-header">
        <span 
            class="column-filter-title"
            :title="title"
        >
            {{ title }}
        </span>
        <NPopover
            v-model:show="open"
            trigger="click"
            placement="bottom-end"
            :show-arrow="true"
            :width="250"
            raw
        >
            <template #trigger>
                <button
                    class="column-filter-trigger"
                    :class="{
                        'column-filter-trigger--active': isFilterApplied
                    }"
                    :title="`Фильтр: ${title}`"
                    aria-label="Открыть фильтр"
                    @click.stop
                >
                    <span class="filter-icon">▾</span>
                </button>
            </template>

            <div
                class="column-filter-menu"
                @click.stop
            >
                <div class="filter-menu-heading">
                    <span class="filter-menu-title">Фильтр: {{ title }}</span>

                    <span class="filter-counter">
                        <span class="filter-counter-selected">
                            {{ filterCounter.selected }}
                        </span>
                        <span class="filter-counter-divider">/</span>
                        <span class="filter-counter-total">
                            {{ filterCounter.total }}
                        </span>
                    </span>
                </div>
                <NInput
                    v-model:value="search"
                    size="small"
                    clearable
                    placeholder="Поиск по значениям"
                />

                <div class="filter-options">
                    <NCheckbox
                        class="select-all"
                        :checked="allSelected"
                        :indeterminate="someSelected && !allSelected"
                        @update:checked="toggleAll"
                    >
                        Выбрать всё
                    </NCheckbox>

                    <NCheckbox
                        v-for="option in filteredOptions"
                        :key="option.value"
                        :checked="selectedValues.has(option.value)"
                        :title="option.label"
                        @update:checked="checked => toggleValue(option.value, checked)"
                    >
                        {{ option.displayLabel }}
                    </NCheckbox>

                    <div
                        v-if="!filteredOptions.length"
                        class="filter-no-options"
                    >
                        Нет совпадений
                    </div>
                </div>

                <div class="filter-condition">
                    <div class="filter-section-title">
                        Условие
                    </div>

                    <NSelect
                        :value="draft.operator"
                        :options="operators"
                        size="small"
                        @update:value="updateOperator"
                    />

                    <NInput
                        v-if="type === 'text'"
                        :value="String(draft.value ?? '')"
                        size="small"
                        clearable
                        placeholder="Введите значение"
                        @update:value="value => draft.value = value"
                    />

                    <NInputNumber
                        v-else-if="type === 'number'"
                        :value="typeof draft.value === 'number' ? draft.value : null"
                        size="small"
                        clearable
                        placeholder="Введите число"
                        @update:value="value => draft.value = value"
                    />

                    <NDatePicker
                        v-else
                        type="date"
                        :value="typeof draft.value === 'number' ? draft.value : null"
                        size="small"
                        clearable
                        @update:value="value => draft.value = value"
                    />

                    <template v-if="draft.operator === 'between'">
                        <NInput
                            v-if="type === 'text'"
                            :value="String(draft.valueTo ?? '')"
                            size="small"
                            clearable
                            placeholder="Второе значение"
                            @update:value="value => draft.valueTo = value"
                        />

                        <NInputNumber
                            v-else-if="type === 'number'"
                            :value="typeof draft.valueTo === 'number' ? draft.valueTo : null"
                            size="small"
                            clearable
                            placeholder="Верхняя граница"
                            @update:value="value => draft.valueTo = value"
                        />

                        <NDatePicker
                            v-else
                            type="date"
                            :value="typeof draft.valueTo === 'number' ? draft.valueTo : null"
                            size="small"
                            clearable
                            @update:value="value => draft.valueTo = value"
                        />
                    </template>

                    <NCheckbox v-model:checked="draft.enabled">
                        Применять условие
                    </NCheckbox>
                </div>

                <NSpace justify="space-between">
                    <NButton
                        size="small"
                        dashed
                        type="error"
                        @click="reset"
                    >
                        Сбросить
                    </NButton>

                    <NButton
                        size="small"
                        type="primary"
                        @click="commit"
                    >
                        Применить
                    </NButton>
                </NSpace>
            </div>
        </NPopover>
    </div>
</template>
<style scoped lang="scss">
.column-filter-header {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-width: 0;
}

.column-filter-title {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.column-filter-trigger {
    flex: 0 0 16px;
    width: 16px;
    height: 15px;
    padding: 0;
    margin-right: 2px;

    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 0 5px 0 #dfdfdf;
    color: #8a929c;

    cursor: pointer;
    transition:
        color 0.18s ease,
        background-color 0.18s ease,
        border-color 0.18s ease;

    &:hover {
        color: #179250;
        background: #f1f7f2;
        border-color: #badac4;
    }

    &:focus-visible {
        outline: 2px solid #14884a;
        outline-offset: 2px;
    }

    &--active {
        color: #519e46;
        background: #e2f0e6;
        border-color: #c8e8d1;
        box-shadow: none;

        &:hover {
            background: #d9f0e0;
            border-color: #b4dfc1;
        }
    }
}

.filter-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1.2;
}

.column-filter-menu {
    display: flex;
    flex-direction: column;
    gap: 7px;
    width: 250px;
    max-height: 65vh;
    padding: 12px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: var(--n-color, #fff);
    color: var(--n-text-color, #333);
    font-size: 13px;

    :deep(.n-checkbox__label),
    :deep(.n-button),
    :deep(.n-input),
    :deep(.n-input-number),
    :deep(.n-base-selection),
    :deep(.n-date-picker) {
        font-size: 13px !important;
    }
}

.filter-menu-heading,
.filter-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #444444;
    
}

.filter-menu-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: #444;
}

.filter-menu-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.filter-counter {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    padding: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
}

.filter-counter-selected {
    color: #168447;
}

.filter-counter-divider {
    color: #b0b8b2;
    font-weight: 400;
}

.filter-counter-total {
    color: #64748b;
}

.filter-options {
    display: flex;
    flex-direction: column;
    gap: 7px;
    height: 220px;
    padding: 0 2px 8px 0;
    overflow-y: auto;
    border-bottom: 1px solid #e8e8e8;
    font-size: 11px;
}

.filter-condition {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-no-options {
    color: #888;
    font-size: 11px;
}
:deep(.select-all) {
    position: sticky;
    top: 0;
    z-index: 2;
    flex-shrink: 0;
    padding: 5px 0;
    background: var(--n-color, #fff);
    border-bottom: 1px solid #e8e8e8;
}
</style>

