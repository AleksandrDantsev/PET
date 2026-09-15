<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
    NButton,
    NDatePicker,
    NDivider,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
    NSpace,
    NSwitch,
    NTag,
} from "naive-ui";
import { hasValue, normalizeForSorting, toNumber, toTimestamp } from "@/utils/normalize";

type DataObject = Record<
    string,
    string | number | boolean | null
>;

interface SortField {
    field: string;
    direction: "asc" | "desc";
}

interface SortHistoryItem {
    id: number;
    fields: SortField[];
}

export interface IInterchangeableFilters {
    search: string;

    branch: string | null;
    manager: string | null;
    hardness: string | null;
    color: string | null;
    neck: string | null;
    componentType: string | null;

    nomenclature: string | null;
    client: string | null;

    arrivalDateFrom: number | null;
    arrivalDateTo: number | null;

    daysFrom: number | null;
    daysTo: number | null;

    quantityFrom: number | null;
    quantityTo: number | null;

    costFrom: number | null;
    costTo: number | null;

    hasPassport: boolean | null;
    hasTask: boolean | null;

    hasArrivalDate: boolean | null;
    hasManager: boolean | null;

    sortFields: SortField[];
}

const props = withDefaults(
    defineProps<{
        result?: DataObject[];
        currentResult?: DataObject[];
    }>(),
    {
        result: () => [],
        currentResult: () => [],
    }
);

const emit = defineEmits<{
    filter: [result: DataObject[]];
    sort: [result: DataObject[]];
    reset: [];
}>();

const filters = reactive<IInterchangeableFilters>({
    search: "",

    branch: null,
    manager: null,
    hardness: null,
    color: null,
    neck: null,
    componentType: null,

    nomenclature: null,
    client: null,

    arrivalDateFrom: null,
    arrivalDateTo: null,

    daysFrom: null,
    daysTo: null,

    quantityFrom: null,
    quantityTo: null,

    costFrom: null,
    costTo: null,

    hasPassport: null,
    hasTask: null,

    hasArrivalDate: null,
    hasManager: null,

    sortFields: [],
});

const sortHistory = reactive<SortHistoryItem[]>([]);
let nextHistoryId = 1;


const addToSortHistory = () => {
    if (filters.sortFields.length === 0)  return;

    const fields: SortField[] =
        filters.sortFields.map(sort => ({
            field: sort.field,
            direction: sort.direction,
        }));

    const existingIndex = sortHistory.findIndex(historyItem =>
        JSON.stringify(historyItem.fields) === JSON.stringify(fields)
    );

    if (existingIndex !== -1) {
        sortHistory.splice(existingIndex, 1);
    }

    sortHistory.unshift({
        id: nextHistoryId++,
        fields,
    });

    if (sortHistory.length > 5) {
        sortHistory.splice(5);
    }
};

const applySortHistory = (historyItem: SortHistoryItem) => {

    filters.sortFields.splice(0, filters.sortFields.length,
        ...historyItem.fields.map(sort => ({
            field: sort.field,
            direction: sort.direction,
        }))
    );

    applySorting();
};

const clearSortHistory = () => {
    sortHistory.splice(0);
};


const getOptions = (field: string) => {
    const values = props.result
        .map(item => item[field])
        .filter(
            value =>
                value !== null &&
                value !== undefined &&
                value !== ""
        )
        .map(String);

    return [...new Set(values)]
        .sort((a, b) => normalizeForSorting(a).localeCompare(
            normalizeForSorting(b), "ru")
        )
        .map(value => ({
            label: value,
            value,
        }));
};


const branchOptions = computed(() =>
    getOptions("Филиал")
);
const managerOptions = computed(() =>
    getOptions("Ответственный за продажу")
);
const colorOptions = computed(() =>
    getOptions("цвет")
);
const neckOptions = computed(() =>
    getOptions("горло")
);
const componentTypeOptions = computed(() =>
    getOptions("комплектующие")
);
const hardnessOptions = computed(() =>
    getOptions("Жесткость")
);
const nomenclatureOptions = computed(() =>
    getOptions("Номенклатура 1С")
);
const clientOptions = computed(() =>
    getOptions("Кому недопродано")
);

const sortOptions = [
    {
        label: "Менеджер",
        value: "Ответственный за продажу",
    },
    {
        label: "Клиент",
        value: "Какому клиенту планируется продажа",
    },
    {
        label: "Дата привоза",
        value: "Кол-во дней с даты привоза",
    },
    {
        label: "Кол-во недопроданного",
        value: "Реальное кол-во недопрод. товара на 02.09.2026",
    },
    {
        label: "Стоимость недопроданного",
        value: "Стоимость недопроданного товара",
    },
    {
        label: "Номенклатура",
        value: "Номенклатура 1С",
    },
    {
        label: "Филиал",
        value: "Филиал",
    },
    {
        label: "Цвет",
        value: "цвет",
    },
    {
        label: "Горло",
        value: "горло",
    },
].sort((a, b) => 
    normalizeForSorting(a.value).localeCompare(normalizeForSorting(b.value), "ru")
);


const includesSearch = (
    item: DataObject,
    search: string
): boolean => {
    if (!search.trim()) {
        return true;
    }

    const normalizedSearch =
        search.toLowerCase().trim();

    // Поля по которым работает поиск по вхождениию (самый верхний поиск)
    const fields = [
        "Номенклатура 1С",
        "Кому недопродано",
        "Номер задачи в битрикс",
        "Ответственный за продажу",
        "Филиал",
        "цвет",
        "горло",
        "комплектующие",
    ];

    return fields.some(field =>
        String(item[field] ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
    );
};

const filteredResult = computed(() => {
    return props.result.filter(item => {
        /* Поиск */

        if (!includesSearch(item, filters.search)) 
        {
            return false;
        }

        /* Номенклатура */

        if (filters.nomenclature !== null &&
            filters.nomenclature !== String(item["Номенклатура 1С"] ?? "")) 
        {
            return false;
        }

        /* Клиент */

        if (filters.client !== null &&
            filters.client !== String(item["Кому недопродано"] ?? "")) 
        {
            return false;
        }

        /* Филиал */

        if (filters.branch !== null &&
            filters.branch !==  String(item["Филиал"] ?? "")) 
        {
            return false;
        }

        /* Менеджер */

        if (filters.manager !== null &&
            filters.manager !== String(item["Ответственный за продажу"] ?? "")) 
        {
            return false;
        }

        /* Жесткость */

        if (filters.hardness !== null &&
            filters.hardness !== String(item["Жесткость"] ?? "")) 
        {
            return false;
        }

        /* Цвет */

        if (filters.color !== null &&
            filters.color !== String(item["цвет"] ?? "")) 
        {
            return false;
        }

        /* Горло */

        if (filters.neck !== null &&
            filters.neck !== String(item["горло"] ?? "")) 
        {
            return false;
        }

        /* Комплектующие */

        if (filters.componentType !== null &&
            filters.componentType !== String(item["комплектующие"] ?? "")) 
        {
            return false;
        }

        /* Дата привоза */

        const arrivalDate =
            toTimestamp<DataObject[string]>(
                item["Дата привоза"]
            );

        if (filters.arrivalDateFrom !== null &&
            (arrivalDate === null ||
             arrivalDate < filters.arrivalDateFrom
            )) return false;

        if (filters.arrivalDateTo !== null &&
            (
                arrivalDate === null ||
                arrivalDate > filters.arrivalDateTo
            )) return false;

        /* Есть дата привоза */

        if (filters.hasArrivalDate !== null) {

            const hasArrivalDate =
                hasValue<DataObject[string]>(item["Дата привоза"]);

            if (hasArrivalDate !== filters.hasArrivalDate) {
                return false;
            }
        }

        /* Дни */

        const days = toNumber<DataObject[string]>(
            item["Кол-во дней с даты привоза"]  // TODO
        );

        if (filters.daysFrom !== null &&
            (
                days === null ||
                days < filters.daysFrom
            )) return false;


        if (filters.daysTo !== null &&
            (
                days === null ||
                days > filters.daysTo
            )) return false;

        /* Количество */

        const quantity = toNumber<DataObject[string]>(
            item["Реальное кол-во недопрод. товара на 02.09.2026"]
        );


        if (filters.quantityFrom !== null &&
            (
                quantity === null ||
                quantity < filters.quantityFrom
            )) return false;


        if (filters.quantityTo !== null &&
            (
                quantity === null ||
                quantity > filters.quantityTo
            )) return false;


        const cost = toNumber<DataObject[string]>(
            item["Стоимость недопроданного товара"]
        );

        if (filters.costFrom !== null &&
            (
                cost === null ||
                cost < filters.costFrom
            )) return false;


        if (filters.costTo !== null &&
            (
                cost === null ||
                cost > filters.costTo
            )) return false;

        /* Паспорт */

        if (filters.hasPassport !== null) {
            const hasPassport =
                hasValue<DataObject[string]>(
                    item["Дата создания паспорта сделки"]
                );

            if (hasPassport !== filters.hasPassport) {
                return false;
            }
        }


        if (filters.hasTask !== null) {
            const hasTask = hasValue<DataObject[string]>(
                item["Номер задачи в битрикс"]
            );

            if (hasTask !== filters.hasTask) {
                return false;
            }
        }


        if (filters.hasManager !== null) {
            const hasManager = hasValue<DataObject[string]>(
                item["Ответственный за продажу"]
            );

            if (hasManager !== filters.hasManager) {
                return false;
            }
        }

        return true;
    });
});


const compareValues = (
    aValue: DataObject[string],
    bValue: DataObject[string],
    field: string
): number => {
    if (
        !hasValue<DataObject[string]>(aValue) &&
        !hasValue<DataObject[string]>(bValue)
    ) {
        return 0;
    }

    if (!hasValue<DataObject[string]>(aValue)) {
        return 1;
    }

    if (!hasValue<DataObject[string]>(bValue)) {
        return -1;
    }

    if (
        field === "Кол-во дней с даты привоза" ||
        field === "Реальное кол-во недопрод. товара на 02.09.2026" ||
        field === "Стоимость недопроданного товара"
    ) {
        const aNumber = toNumber<DataObject[string]>(aValue);

        const bNumber = toNumber<DataObject[string]>(bValue);

        if (
            aNumber !== null &&
            bNumber !== null
        ) {
            return aNumber - bNumber;
        }

        if (aNumber === null) {
            return 1;
        }

        return -1;
    }

    if (field === "Дата привоза") {
        const aDate = toTimestamp<DataObject[string]>(aValue);

        const bDate = toTimestamp<DataObject[string]>(bValue);

        if (
            aDate !== null &&
            bDate !== null
        ) {
            return aDate - bDate;
        }

        if (aDate === null) {
            return 1;
        }

        return -1;
    }

    return normalizeForSorting<DataObject[string]>(aValue).localeCompare(
        normalizeForSorting<DataObject[string]>(bValue),
        "ru",
        {
            numeric: true,
            sensitivity: "base",
        }
    );
};


const sortResult = (
    source: DataObject[],
    sortFields: SortField[]): DataObject[] => 
{
    if (
        !Array.isArray(sortFields) ||
        sortFields.length === 0
    ) {
        return [...source];
    }

    const result = [...source];

    result.sort((a, b) => {
        for (const sortField of sortFields) {

            const comparison = compareValues(
                a[sortField.field],
                b[sortField.field],
                sortField.field
            );

            if (comparison !== 0) {
                return sortField.direction ===
                    "asc"
                    ? comparison
                    : -comparison;
            }
        }

        return 0;
    });

    return result;
};

const sortedCurrentResult = computed(
    () => {
        return sortResult(
            props.currentResult,
            filters.sortFields
        );
    }
);


const addSortField = () => {
    const availableOption = sortOptions.find(option =>
        !filters.sortFields.some(
            sort => sort.field === option.value
        )
    );
    console.log(availableOption)
    if (!availableOption) {
        return;
    }

    filters.sortFields.push({
        field: availableOption.value,
        direction: "asc",
    });
};

const removeSortField = (index: number) => {
    if (
        index < 0 ||
        index >= filters.sortFields.length
    ) {
        return;
    }

    filters.sortFields.splice(index, 1);
};

const getAvailableSortOptions = (
    currentIndex: number
) => {
    const selectedFields = filters.sortFields
        .map((sort, index) =>
            index === currentIndex
                ? null
                : sort.field
        )
        .filter((field): field is string =>
            field !== null
        );

    return sortOptions.filter(
        option =>
            !selectedFields.includes(
                option.value
            )
    );
};

const draggedSortIndex =
    ref<number | null>(null);

const dragOverSortIndex =
    ref<number | null>(null);

const onSortDragStart = (
    index: number
) => {
    draggedSortIndex.value = index;
};

const onSortDragOver = (
    event: DragEvent,
    index: number
) => {
    event.preventDefault();

    dragOverSortIndex.value = index;
};

const onSortDrop = (index: number) => {
    const fromIndex = draggedSortIndex.value;

    if (
        fromIndex === null ||
        fromIndex < 0 ||
        fromIndex >= filters.sortFields.length
    ) {
        draggedSortIndex.value = null;
        dragOverSortIndex.value = null;

        return;
    }

    if (fromIndex === index) {
        draggedSortIndex.value = null;
        dragOverSortIndex.value = null;

        return;
    }

    const movedField =
        filters.sortFields[fromIndex];

    if (!movedField) {
        draggedSortIndex.value = null;
        dragOverSortIndex.value = null;

        return;
    }

    filters.sortFields.splice(
        fromIndex,
        1
    );

    const targetIndex =
        fromIndex < index
            ? index - 1
            : index;

    filters.sortFields.splice(
        targetIndex,
        0,
        movedField
    );

    draggedSortIndex.value = null;
    dragOverSortIndex.value = null;
};

const onSortDragEnd = () => {
    draggedSortIndex.value = null;
    dragOverSortIndex.value = null;
};


const applySorting = () => {
    if (
        !Array.isArray(filters.sortFields) ||
        filters.sortFields.length === 0
    ) return;

    if (
        !Array.isArray(props.currentResult) ||
        props.currentResult.length === 0
    ) {
        return;
    }

    addToSortHistory();
    emit("sort", sortedCurrentResult.value);
};


const applyFilters = () => {
    emit("filter", filteredResult.value);
};


const hasActiveFilters = computed(
    () => Object.entries(filters).some(([key, value]) => {
        if (key === "sortFields") {
            return false;
        }

        if (key === "search") {
            return value !== "";
        }

        return value !== null;
    })
);

const activeFiltersCount =
    computed(() => Object.entries(filters)
        .filter(([key, value]) => {
            if (key === "sortFields") {
                return false;
            }

            if (key === "search") {
                return value !== "";
            }

            return value !== null;
        }).length
    )


const resetFilters = () => {
    (Object.keys(filters) as Array<keyof typeof filters>).forEach(key => {
        if (key === "sortFields") {
            filters.sortFields.splice(0);
        } else if (key === "search") {
            filters.search = "";
        } else {
            filters[key] = null;
        }
    });

    emit("reset");
};


const getSortLabel = (field: string): string => {
    const option = sortOptions.find(
        item => item.value === field
    );

    return option?.label ?? field;
};

const getHistoryLabel = ( item: SortHistoryItem): string => {
    return item.fields
        .map(sort => 
            `${getSortLabel(sort.field)} ${sort.direction === "asc" ? "↑" : "↓"}`
        ).join(" → ");
};
</script>

<template>
    <aside class="filters-panel">
        <n-form
            label-placement="top"
            size="small"
        >
            <div class="filters-top">
                <div class="filters-header">
                    <div class="filters-title">
                        <span>
                            Фильтры
                        </span>

                        <n-tag
                            v-if="activeFiltersCount"
                            size="small"
                            round
                            :bordered="false"
                        >
                            <span class="counter">
                                {{activeFiltersCount}}
                            </span>
                        </n-tag>
                    </div>

                    <n-button
                        v-if=" hasActiveFilters"
                        text
                        size="small"
                        @click="resetFilters"
                    >
                        Сбросить
                    </n-button>
                </div>

                <!-- ПОИСК -->

                <n-form-item
                    label="Поиск"
                >
                    <n-input
                        v-model:value="filters.search"
                        placeholder="Товар, клиент, задача..."
                        clearable
                    />
                </n-form-item>

                <div class="sorting">
                    <div
                        class="sorting-header"
                    >
                        <span class="sorting-title">
                            Сортировка
                        </span>

                        <span
                            v-if="filters.sortFields.length > 0"
                            class="sorting-hint"
                        >
                            {{ filters.sortFields.length }}
                            {{ filters.sortFields.length === 1 ? "уровень" : "уровня" }}
                        </span>
                    </div>

                    <div
                        v-if="filters.sortFields.length > 0"
                        class="sort-list"
                    >
                        <div
                            v-for="(sort, index) in filters.sortFields"
                            :key="`${sort.field}-${index}`"
                            class="sort-row"
                            :class="{
                                'sort-row-dragging': draggedSortIndex === index,
                                'sort-row-drag-over': dragOverSortIndex === index &&
                                    draggedSortIndex !== index,
                            }"
                            draggable="true"
                            @dragstart="onSortDragStart(index)"
                            @dragover="onSortDragOver($event, index)"
                            @drop="onSortDrop(index)"
                            @dragend="onSortDragEnd"
                        >
                            <span
                                class="sort-drag-handle"
                                title="Перетащить"
                            > ⋮⋮ </span>

                            <span
                                class="sort-index"
                            >
                                {{ index + 1 }}.
                            </span>

                            <n-select
                                v-model:value="sort.field"
                                :options="getAvailableSortOptions(index)"
                                size="small"
                            />

                            <n-button
                                size="small"
                                quaternary
                                class="sort-direction"
                                @click="sort.direction = (sort.direction === 'asc') ? 'desc' : 'asc'"
                            >
                                {{ sort.direction === "asc" ? "↑" : "↓"}}
                            </n-button>

                            <n-button
                                size="small"
                                quaternary
                                class="remove-sort"
                                @click="removeSortField(index)"
                            >
                                ×
                            </n-button>
                        </div>
                    </div>

                    <n-button
                        dashed
                        size="small"
                        block
                        :disabled="filters.sortFields.length >= sortOptions.length"
                        @click="addSortField"
                    >
                        + Добавить уровень
                    </n-button>

                    <!-- SORT -->

                    <n-button
                        type="primary"
                        size="small"
                        block
                        :disabled="filters.sortFields.length === 0 || currentResult.length === 0"
                        @click="applySorting"
                    >
                        Сортировать
                    </n-button>

                    <div
                        v-if="sortHistory.length > 0"
                        class="sort-history"
                    >
                        <div class="sort-history-header">
                            <span>
                                Последние сортировки
                            </span>

                            <n-button
                                text
                                size="tiny"
                                @click="clearSortHistory"
                            >
                                Очистить
                            </n-button>
                        </div>

                        <div
                            class="sort-history-list"
                        >
                            <button
                                v-for="historyItem in sortHistory"
                                :key="historyItem.id"
                                type="button"
                                class="sort-history-item"
                                @click="applySortHistory(historyItem)"
                            >
                                <span class="history-icon"> ↻ </span>

                                <span class="history-text">
                                    {{ getHistoryLabel(historyItem)}}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <n-divider />

            <n-form-item
                label="Номенклатура"
            >
                <n-select
                    v-model:value="filters.nomenclature"
                    :options="nomenclatureOptions"
                    placeholder="Все товары"
                    filterable
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Кому недопродано"
            >
                <n-select
                    v-model:value="filters.client"
                    :options="clientOptions"
                    placeholder="Все клиенты"
                    filterable
                    clearable
                />
            </n-form-item>

            <n-form-item label="Филиал">
                <n-select
                    v-model:value="filters.branch"
                    :options="branchOptions"
                    placeholder="Все филиалы"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Ответственный за продажу"
            >
                <n-select
                    v-model:value="filters.manager"
                    :options="managerOptions"
                    placeholder="Все менеджеры"
                    filterable
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Жесткость"
            >
                <n-select
                    v-model:value="filters.hardness"
                    :options="hardnessOptions"
                    placeholder="Любая"
                    clearable
                />
            </n-form-item>

            <n-form-item label="Цвет">
                <n-select
                    v-model:value="filters.color"
                    :options="colorOptions"
                    placeholder="Любой"
                    filterable
                    clearable
                />
            </n-form-item>

            <n-form-item label="Горло">
                <n-select
                    v-model:value="filters.neck"
                    :options="neckOptions"
                    placeholder="Любое"
                    filterable
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Комплектующие"
            >
                <n-select
                    v-model:value="filters.componentType"
                    :options="componentTypeOptions"
                    placeholder="Любые"
                    clearable
                />
            </n-form-item>

            <n-divider />

            <n-form-item
                label="Дата привоза"
            >
                <n-space
                    vertical
                    :size="6"
                    style="width: 100%"
                >
                    <n-date-picker
                        v-model:value="filters.arrivalDateFrom"
                        type="date"
                        clearable
                        placeholder="От"
                        style="width: 100%"
                    />

                    <n-date-picker
                        v-model:value="filters.arrivalDateTo"
                        type="date"
                        clearable
                        placeholder="До"
                        style="width: 100%"
                    />
                </n-space>
            </n-form-item>

            <n-form-item
                label="Дней с даты привоза"
            >
                <div
                    class="range-fields"
                >
                    <n-input-number
                        v-model:value="filters.daysFrom"
                        :min="0"
                        placeholder="От"
                        clearable
                    />

                    <n-input-number
                        v-model:value="filters.daysTo"
                        :min="0"
                        placeholder="До"
                        clearable
                    />
                </div>
            </n-form-item>

            <n-form-item
                label="Кол-во недопроданного"
            >
                <div
                    class="range-fields"
                >
                    <n-input-number
                        v-model:value="filters.quantityFrom"
                        :min="0"
                        placeholder="От"
                        clearable
                    />

                    <n-input-number
                        v-model:value="filters.quantityTo"
                        :min="0"
                        placeholder="До"
                        clearable
                    />
                </div>
            </n-form-item>

            <n-form-item
                label="Стоимость недопроданного"
            >
                <div
                    class="range-fields"
                >
                    <n-input-number
                        v-model:value="filters.costFrom"
                        :min="0"
                        placeholder="От"
                        clearable
                    />

                    <n-input-number
                        v-model:value="filters.costTo"
                        :min="0"
                        placeholder="До"
                        clearable
                    />
                </div>
            </n-form-item>

            <n-divider />

            <div class="switches">
                <div class="switch-row">
                    <span>
                        Есть паспорт сделки
                    </span>

                    <n-switch
                        :value="filters.hasPassport === true"
                        @update:value="value => filters.hasPassport = value ? true : null"
                    />
                </div>

                <div class="switch-row">
                    <span>
                        Есть задача Битрикс
                    </span>

                    <n-switch
                        :value="filters.hasTask === true"
                        @update:value="(value) => filters.hasTask = value ? true : null"
                    />
                </div>

                <div class="switch-row">
                    <span>
                        Есть дата привоза
                    </span>

                    <n-switch
                        :value="filters.hasArrivalDate === true"
                        @update:value="(value) => filters.hasArrivalDate = value ? true : null"
                    />
                </div>

                <div class="switch-row">
                    <span>
                        Есть ответственный
                    </span>

                    <n-switch
                        :value="filters.hasManager === true"
                        @update:value="(value) => filters.hasManager = value ? true : null"
                    />
                </div>
            </div>

            <div class="bottom-spacer" />
        </n-form>

        <div class="filters-bottom">
            <n-button
                type="primary"
                block
                @click="applyFilters"
            >
                Применить фильтры
            </n-button>
        </div>
    </aside>
</template>

<style lang="scss" scoped>
.filters-panel {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: 0 14px 14px;
    background: #fafafa;
}

.filters-top {
    position: sticky;
    top: 0;
    z-index: 100;
    padding-top: 14px;
    padding-bottom: 4px;
    background: #fafafa;
    box-shadow:
        0 5px 10px -10px
        rgb(0 0 0 / 45%);
}

@media screen and (min-width: 900px) {
  .filters-top {
    position: static;
  }
}

.filters-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
}

.filters-title {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #292929;
    font-size: 13px;
    font-weight: 600;
}

.counter {
    font-size: 8px;
}

.sorting {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 4px;
}

.sorting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sorting-title {
    color: #777;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.sorting-hint {
    color: #aaa;
    font-size: 9px;
}

.sort-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.sort-row {
    display: grid;
    grid-template-columns:
        18px
        20px
        minmax(0, 1fr)
        30px
        30px;

    align-items: center;
    gap: 4px;
    padding: 3px;
    border-radius: 5px;
    background: transparent;
    transition:
        background 0.15s,
        opacity 0.15s,
        transform 0.15s;
}

.sort-row:hover {
    background: #f0f0f0;
}

.sort-row-dragging {
    opacity: 0.45;
    background: #e8e8e8;
    transform: scale(0.99);
}

.sort-row-drag-over {
    background: #e5e5e5;
    box-shadow:
        inset 0 2px 0 #999;
}

.sort-drag-handle {
    color: #999;
    font-size: 13px;
    line-height: 1;
    cursor: grab;
    user-select: none;
}

.sort-drag-handle:active {
    cursor: grabbing;
}

.sort-index {
    color: #999;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
}

.sort-direction {
    min-width: 30px;
    font-size: 16px;
}

.remove-sort {
    min-width: 30px;
    color: #999;
    font-size: 18px;
}

.remove-sort:hover {
    color: #d03050;
}

.sort-history {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid #e8e8e8;
}

.sort-history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #999;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
}

.sort-history-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.sort-history-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 5px 6px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: #666;
    font-family: inherit;
    font-size: 10px;
    text-align: left;
    cursor: pointer;
    transition:
        background 0.15s,
        color 0.15s;
}

.sort-history-item:hover {
    background: #eeeeee;
    color: #222;
}

.history-icon {
    flex: 0 0 auto;
    width: 18px;
    color: #999;
    font-size: 12px;
}

.history-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.range-fields {
    display: grid;
    grid-template-columns:
        1fr 1fr;
    gap: 6px;
    width: 100%;
}

.switches {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 24px;
    color: #555;
    font-size: 11px;
}

.bottom-spacer {
    height: 65px;
}

.filters-bottom {
    position: sticky;
    bottom: 0;
    z-index: 100;
    margin: 0 -14px;
    padding: 12px 14px 14px;
    background: #fafafa;
    box-shadow:
        0 -5px 10px -10px
        rgb(0 0 0 / 45%);
}

:deep(.n-form-item-label) {
    padding-bottom: 4px;
}

:deep(.n-form-item-label__text) {
    color: #777;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-base-selection),
:deep(.n-date-picker) {
    font-size: 12px;
}
</style>