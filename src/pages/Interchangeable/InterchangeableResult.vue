
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTableComments } from "@/composables/useTableComments.ts";
import { useTableSearch, type SortingPriorityField } from "@/composables/useTableSearch";
import { useResultTableColumns } from "@/composables/useResultTableColumns.ts";
import { useHiddenRows } from "@/composables/useHiddenRows.ts";
import { useTableTests } from "@/composables/useTableTests";
import {
    NButton,
    NDataTable,
    NInput,
    NSpace,
    NEmpty,
    NBadge,
    type DataTableInst,
} from "naive-ui";
import type { DataObject, SearchFormValue } from "@/types/TableSheetData.ts";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import InterchangeableClientDemand from "./InterchangeableClientDemand.vue";
import { useTableFilters } from "@/composables/useTableFilters";


const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
    searchedFields: SearchFormValue | null;
}>();

const tableData = computed(() => props.filteredActualResultObjs);

const {
    getStoredComment,
    getDraftComment,
    updateDraftComment,
    saveComment,
} = useTableComments(
    () => props.clientsDemand,
    () => props.searchedFields?.nomenclature,
);

const tableTests = useTableTests(
    () => props.clientsDemand,
);

const searchQuery = defineModel<string>("searchQuery", {
    default: "",
});


const PAGINATION_LENGTH = 15;
const currentPage = ref(1);

const {
    debouncedSearchQuery,
    sortingByPriorityField,
    updateSearchQuery,
    searchedData,
    displayedData,
    isClientAndNomenclatureMatch,
    isNomenclatureMatch,
} = useTableSearch(
    () => tableData.value,
    () => props.clientsDemand,
    () => props.searchedFields,
    () => searchQuery.value,
);

const {
    hiddenRows,
    hiddenRowsMode,
    hiddenRowsOptions,
    hiddenRowsCount,
    getHiddenKey,
    toggleHidden,
} = useHiddenRows(
    () => props.clientsDemand,
    () => tableData.value,
);

const tableRef = ref<DataTableInst | null>(null);
const { copy } = useCopyToClipboard();

const sortingFields = [
    {
        label: "Этот менеджер / клиент",
        value: "sameManagerSameClient",
    },
    {
        label: "Этот менеджер / другой клиент",
        value: "sameManagerAnotherClient",
    },
    {
        label: "Другой менеджер / клиент",
        value: "anotherManagerAnotherClient",
    },
] satisfies {
    label: string;
    value: SortingPriorityField;
}[];

const hasClientDemand = computed(
    () => Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length
    ),
);

const getRowClassName = (row: DataObject): string => {
    const classes: string[] = [];

    if (isClientAndNomenclatureMatch(row)) {
        classes.push("searched-match-row");
    } else if (isNomenclatureMatch(row)) {
        classes.push("searched-nomenclature-row");
    }

    if (hasClientDemand.value && hiddenRows.value.has(getHiddenKey(row))) {
        classes.push("hidden-row");
    }

    return classes.join(" ");
};

const {
    tableFilters,
    filterDefaults,
    getUniqueValues,
    getTableFilter,
    updateTableFilter,
    filteredData: filteredByColumns,
} = useTableFilters(
    () => tableData.value,
    () => displayedData.value,
);

const { columns } = useResultTableColumns({
    clientsDemand: () => props.clientsDemand,
    currentPage,
    paginationLength: PAGINATION_LENGTH,

    comments: {
        getStoredComment,
        getDraftComment,
        updateDraftComment,
        saveComment,
    },

    filters: {
        filterDefaults,
        getUniqueValues,
        getTableFilter,
        updateTableFilter,
    },

    hiddenRows: {
        hiddenRows,
        getHiddenKey,
        toggleHidden,
    },
    tests: tableTests,
    copy,
});

const rowKey = (row: DataObject) => JSON.stringify(row);

const visibleData = computed(() => {
    return filteredByColumns.value.filter(row => {
        const isHidden = hiddenRows.value.has(getHiddenKey(row));

        if (!hasClientDemand.value) return true;

        switch (hiddenRowsMode.value) {
        case "all":
            return true;
        case "visible":
            return !isHidden;
        case "hidden":
            return isHidden;
        }
    });
});

const pagination = computed(() =>
    visibleData.value.length > PAGINATION_LENGTH
        ? {
            page: currentPage.value,
            pageSize: PAGINATION_LENGTH,
            showSizePicker: false,
            showQuickJumper: false,
        }
        : false,
);

const handlePageUpdate = (page: number) => {
    currentPage.value = page;
    scrollPageToTop();
};

watch(visibleData, () => {
    currentPage.value = 1;
});


const clearFilters = () => {
    searchQuery.value = "";
    debouncedSearchQuery.value = "";

    tableFilters.value = {};
    sortingByPriorityField.value = "";

    tableRef.value?.clearSorter();

    currentPage.value = 1;
};

const scrollPageToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
</script>
<template>
    <div class="result-container">
        <div class="container-result">
            <Transition name="client-demand">
                <InterchangeableClientDemand
                    v-if="hasClientDemand"
                    :clients-demand="clientsDemand"
                />
            </Transition>

            <div 
                class="table-toolbar"
            >
                <NSpace
                    align="center"
                    justify="space-between"
                    :wrap="true"
                >
                    <NSpace
                        align="center"
                        :size="10"
                    >
                        <NInput
                            :value="searchQuery"
                            class="table-search"
                            clearable
                            size="small"
                            placeholder="Поиск по таблице"
                            @update:value="value => {
                                searchQuery = value;
                                updateSearchQuery(value);
                            }"
                        />
                        <div 
                            v-if="hasClientDemand && searchedData.length"
                            class="triple-toggle"
                        >
                            <template
                                v-for="(option, index) in hiddenRowsOptions"
                                :key="option.value + index"
                            >
                                <NBadge
                                    v-if="option.value === 'hidden'"
                                    :value="hiddenRowsCount"
                                    :show="hiddenRowsCount > 0"
                                    :offset="[0, 2]"
                                >
                                    <button
                                        :class="{ active: hiddenRowsMode === option.value }"
                                        @click="hiddenRowsMode = option.value"
                                    >
                                        {{ option.label }}
                                    </button>
                                </NBadge>

                                <button
                                    v-else
                                    :class="{ active: hiddenRowsMode === option.value }"
                                    @click="hiddenRowsMode = option.value"
                                >
                                    {{ option.label }}
                                </button>
                            </template>
                        </div>
                    </NSpace>

                    <NSpace
                        v-if="hasClientDemand && searchedData.length"
                        align="center"
                    >
                        <div class="triple-toggle priority-toggle">
                            <button
                                v-for="field in sortingFields"
                                :key="field.value"
                                :class="{ active: sortingByPriorityField === field.value }"
                                @click="sortingByPriorityField =
                                    sortingByPriorityField === field.value ? '' : field.value"
                            >
                                {{ field.label }}
                            </button>
                        </div>
                    </NSpace>

                    <NSpace
                        align="center"
                        :size="6"
                    >
                        <span class="result-count">
                            Найдено: {{ visibleData.length }}
                        </span>

                        <NButton
                            class="clear-button"
                            size="small"
                            dashed
                            @click="clearFilters"
                        >
                            Сбросить фильтры
                        </NButton>
                    </NSpace>
                </NSpace>
            </div>
            <NDataTable
                ref="tableRef"
                class="result-table"
                :columns="columns"
                :data="visibleData"
                :bordered="false"
                :single-line="false"
                :single-column="false"
                :striped="true"
                :scroll-x="1016"
                :row-key="rowKey"
                table-layout="fixed"
                :row-class-name="getRowClassName"
                :pagination="pagination"
                @update:page="handlePageUpdate"
            >   
                <template #empty>
                    <div style="min-height: 10px;">
                        <NEmpty
                            :description="'Не найдены взаимозаменяемые позиции из недопроданных'"
                            size="medium"
                        />
                    </div>
                </template>
            </NDataTable>
        </div>
    </div>
</template>

<style scoped lang="scss">
.result-container {
    width: 98%;
    min-height: 40vh;
    margin: 20px auto;
}

.container-result {
    width: 100%;
}

.table-toolbar {
    margin-bottom: 16px;
}

.table-search {
    min-width: 200px;
    width: 200px;
    font-size: 12px;
}

.result-count {
    display: block;
    color: #85827b;
    font-size: 11px;
    line-height: 1;
    min-width: 72px;
    margin-right: 10px;
}

.hardness-cell {
    display: flex;
    align-items: baseline;
    gap: 3px;
    white-space: nowrap;
    font-size: 11px;
}

.clear-button {
    font-size: 12px;
}

:deep(.hardness-value) {
    font-size: 11px;
    font-weight: 500;
}

.hardness-days {
    color: #77756f;
    font-size: 10px;
}

.client-demand-enter-active,
.client-demand-leave-active {
    transition: opacity 0.15s ease;
}

.client-demand-enter-from,
.client-demand-leave-to {
    opacity: 0;
}

.expanded-row-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 0;
}

:deep(.row-comment) {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 5px;
}

.row-comment-label {
    color: #77756f;
    font-size: 11px;
    font-weight: 600;
}

:deep(.row-comment-control) {
    display: flex;
    width: 100%;
    overflow: hidden;
    outline: 1px solid #ecece7;
    margin-bottom: 10px;
    border-radius: 2px;
    background: #fff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
        outline-color: #0159dfb6;
    }
}

:deep(.button-unsuitable) {
    background-color: #003c97b6 !important;
}

:deep(.row-comment-control-bottom) {
    margin-top: 10px;

    &:focus-within {
        outline-color: #5df5a4b6;
    }
}

:deep(.row-comment-input) {
    flex: 1;
    width: 90%;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
    min-width: 0;
    font-size: 12px;
}

:deep(.client-cell) {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
}

:deep(.comment-icon-wrapper) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: help;
}

:deep(.comment-icon) {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    transition: color 0.2s ease;
}

:deep(.comment-icon--unsuitable.comment-icon--active) {
    color: #e05252;
}

:deep(.comment-icon--nomenclature.comment-icon--active) {
    color: #3569a8;
}

:deep(.comment-icon--empty) {
    color: #a0a0a0;
}

.row-comment-control :deep(.n-input__border),
.row-comment-control :deep(.n-input__state-border) {
    display: none;
}

.row-comment-control :deep(.n-input-wrapper) {
    padding: 5px 9px;
}

.row-comment-control :deep(textarea) {
    font-size: 12px;
    line-height: 1.5;
}
:deep(.row-comment-save) {
    height: auto;
    font-size: 12px;
    border: none;
    outline: none;
    border-radius: 0;
}
.row-comment-save:disabled {
    opacity: 0.55;
}
:deep(.hidden-row td) {
    opacity: 0.5;
}

:deep(.n-badge-sup) {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    line-height: 1;
    min-width: 11px;
    height: 14px;
    padding: 0 2px;
}

.triple-toggle {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 20px;
    background: #f0f0f0;

    button {
        padding: 5px 10px;
        border: none;
        border-radius: 16px;
        background: transparent;
        color: #777;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
            background: #fff;
            color: #18a058;
            box-shadow: 0 1px 3px #0000001a;
        }
    }

    &.priority-toggle {
        background: #edf2f8;

        button {
            &.active {
                color: #3569a8;
                background: #fff;
                box-shadow: 0 1px 3px #3569a81a;
            }

            &:hover:not(.active) {
                color: #3569a8;
            }
        }
    }
}

$colorSvg: #a0a0a0;

:deep(.hide-line) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    background-color: transparent;
    color: $colorSvg;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: #e09b32;
    }
}

:deep(.hide-line--active) {
    color: #e05252;

    &:hover {
        color: #2e9d65;
    }
}
:deep(.n-pagination-item) {
    font-size: 13px;
}

:deep(.result-table) {
    min-height: calc(100vh - 220px);
}

:deep(.n-data-table-th) {
    user-select: none;
    -webkit-user-select: none;
}

:deep(.n-data-table .n-data-table-td),
:deep(.n-data-table .n-data-table-th) {
    padding: 6px;
    font-size: 11px;
}

:deep(.n-data-table-table) {
    table-layout: fixed;
}

:deep(.n-data-table .n-data-table-th) {
    white-space: nowrap;
}

:deep(.n-data-table .n-data-table-td) {
    overflow: hidden;
}
:deep(.n-data-table__pagination) {
    position: sticky;
    bottom: 0;
    z-index: 10;
    padding: 13px 0;
    margin-top: 20px;
    background: #fff;
    box-shadow: 0 -5px 10px #cacaca33;
}
:deep(.product-color) {
    display: block;
    flex: 0 0 6px;
    width: 6px;
    height: 6px;
    min-width: 6px;
    border-radius: 50%;
    margin: 0 5px;
    box-shadow:
        0 0 0 2px #fff,
        0 0 0 3px #00000027
}
:deep(.nomenclature-cell) {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 6px;
}

@mixin searched-row(
    $background,
    $shadow,
    $border,
    $hover-background: #e5e8ece7
) {
    td {
        background-color: $background !important;
        box-shadow: 5px 0 5px 0 $shadow;
    }

    td:first-child {
        box-shadow: inset 2px 0 0 $border;
    }

    &:hover td {
        background-color: $hover-background !important;
    }
}


:deep(.n-data-table .searched-match-row) {
    @include searched-row(
        #f3e5df96,
        #ecdbd56b,
        #dbaa965e,
        #f5e9e4
    );
}

:deep(.n-data-table .searched-nomenclature-row) {
    @include searched-row(
        #d6dde78e,
        #dde5ee91,
        #83a5cc4b,
        #ebeef3e7
    );
}



:deep(.n-data-table-sorter) {
    display: none !important;
}

@mixin copyable-text {
    padding: 4px 10px;
    background-color: #fafafa;
    border-radius: 7px;
    user-select: none;
    box-shadow: 1px 3px 5px #cfcfcf7c;
    transition: 500ms ease;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
       box-shadow: 1px 5px 8px #cfcfcf9f; 
    }
}

:deep(.nomenclature-value) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    @include copyable-text;
}

:deep(.client-copyable-text) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;

    @include copyable-text;
}

:deep(.n-radio-button) {
    height: 22px;
    font-size: 11px;
}

:deep(.n-radio-button__label) {
    padding: 0 8px;
    line-height: 22px;
}

.priority-toggle {
    button {
        padding: 5px 10px;
        font-size: 11px;
    }
}

@media (max-width: 900px) {
    .result-container {
        width: calc(100% - 24px);
        margin-top: 16px;
    }
}

@media (max-width: 600px) {
    .result-container {
        width: calc(100% - 16px);
        margin-top: 12px;
        margin-bottom: 24px;
    }

    .table-search {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .client-demand-enter-active,
    .client-demand-leave-active {
        transition: none;
    }
}
</style>