<script setup lang="ts">
import { computed, h, ref } from "vue";
import {
    NButton,
    NDataTable,
    NInput,
    NSpace,
    type DataTableColumns,
    type DataTableInst,
} from "naive-ui";
import type { DataObject } from "@/types/TableSheetData.ts";
import { getHardnessColor, getProductColor } from "@/utils/colorHelpers.ts";
import {
    cutOverflowedText,
    formatNumber,
    normalize,
    setDaysText,
    trimTrailingZeros,
    handleFormatNumber,
    toTimestamp,
} from "@/utils/normalize";
import { debounce } from "@/utils/debounce";
import InterchangeableClientDemand from "./InterchangeableClientDemand.vue"
import InterchangeableAdditionalInfo from "./InterchangeableAdditionalInfo.vue";
import { CONST_TITLES } from "@/configs/CONFIG_CONST.ts";

const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
}>();


const tableData = computed(() => props.filteredActualResultObjs);
const searchQuery = defineModel<string>("searchQuery", {
    default: "",
});

const debouncedSearchQuery = ref(searchQuery.value);

const updateSearchQuery = debounce((value: string) => {
    debouncedSearchQuery.value = value;
}, 500);

const tableRef = ref<DataTableInst | null>(null);

const includedFields = [
    CONST_TITLES.DELIVERY_DATE,
    CONST_TITLES.DAYS_SINCE_DELIVERY,
    CONST_TITLES.UNDERSOLDED_PRODUCT_QUANTITY,
    CONST_TITLES.ORDERING_MANAGER,
    CONST_TITLES.UNDERSOLDED_CLIENT,
    CONST_TITLES.REMAINDER_1C,
    CONST_TITLES.UNDERSALE_REASON,
    CONST_TITLES.NEXT_ACTION,
    CONST_TITLES.ALL_CUSTOMERS_SHIPPED_ITEM_MANAGER,
];

const searchableFields = [
    CONST_TITLES.ONE_C_NOMENCLATURE,
    CONST_TITLES.RESPONSIBLE_MANAGER,
    CONST_TITLES.BRANCH,
    CONST_TITLES.CURRENT_CLIENT,
    CONST_TITLES.UNDERSOLDED_COST,
    CONST_TITLES.HARDNESS,
    CONST_TITLES.REMAINDER_BOXES_1C,
];

const getUniqueValues = (key: string) => {
    return [
        ...new Set(
            tableData.value
                .map(row => row[key])
                .filter(value =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                )
                .map(value => String(value))
        ),
    ]
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map(value => ({
            label: value,
            value,
        }));
};

const createFilter = (key: string) => {
    return (value: string | number, row: DataObject) => {
        return String(row[key] ?? "") === String(value);
    };
};

const getAdditionalFields = (row: DataObject) => {
    return includedFields
        .filter(key => {
            const value = row[key];

            return (
                value !== null &&
                value !== undefined &&
                value !== ""
            );
        })
        .map(key => ({
            key,
            value: row[key],
        }));
};

const searchedData = computed(() => {
    const query = normalize(debouncedSearchQuery.value);

    if (!query) {
        return tableData.value;
    }
    
    return tableData.value.filter(row =>
        searchableFields.some(key =>
            normalize(row[key]).includes(query)
        )
    );
});

const rowKey = (row: DataObject) => JSON.stringify(row);

const columns = computed<DataTableColumns<DataObject>>(() => [
    {
        title: "№п/п",
        key: "index",
        width: 20,
        align: "center",
        render: (_row, index) => index + 1,
    },

    {
        title: "Номенклатура",
        key: CONST_TITLES.ONE_C_NOMENCLATURE,
        width: 130,
        sorter: "default",
        filter: createFilter(
            CONST_TITLES.ONE_C_NOMENCLATURE
        ),
        filterMultiple: true,
        filterOptions: getUniqueValues(
            CONST_TITLES.ONE_C_NOMENCLATURE
        ),
        resizable: true,

        render: row => {
            const nomenclature =
                row[CONST_TITLES.ONE_C_NOMENCLATURE];

            const color = getProductColor(
                nomenclature as string | undefined
            );

            return h("div", { class: "nomenclature-cell" }, [
                h(
                    "span",
                    {
                        class: "product-color",
                        style: {
                            backgroundColor: color,
                        },
                    }
                ),
                h(
                    "span",
                    {
                        class: "nomenclature-value",
                    },
                    nomenclature || "-"
                ),
            ]);
        },
    },
    {
        title: "Менеджер",
        key: CONST_TITLES.RESPONSIBLE_MANAGER,
        width: 55,
        sorter: "default",
        filter: createFilter(
            CONST_TITLES.RESPONSIBLE_MANAGER
        ),
        filterMultiple: true,
        filterOptions: getUniqueValues(
            CONST_TITLES.RESPONSIBLE_MANAGER
        ),
        resizable: true,
        render: (row) => row[CONST_TITLES.RESPONSIBLE_MANAGER] || "-"
    },

    {
        title: "Филиал",
        key: CONST_TITLES.BRANCH,
        width: 45,
        sorter: "default",
        filter: createFilter(
            CONST_TITLES.BRANCH
        ),
        filterMultiple: true,
        filterOptions: getUniqueValues(
            CONST_TITLES.BRANCH
        ),
        resizable: true,
    },



    {
        title: "Клиент",
        key: CONST_TITLES.CURRENT_CLIENT,
        width: 140,
        search: true,
        sorter: "default",
        filter: createFilter(
            CONST_TITLES.CURRENT_CLIENT
        ),
        filterMultiple: true,
        filterOptions: getUniqueValues(
            CONST_TITLES.CURRENT_CLIENT
        ),
        resizable: true,
        render: (row) => cutOverflowedText(row[CONST_TITLES.CURRENT_CLIENT], 40) || "-",
    },

    {
        title: "Стоимость",
        key: CONST_TITLES.UNDERSOLDED_COST,
        width: 40,
        resizable: true,

        sorter: (rowA, rowB) => {
            const costA = handleFormatNumber(rowA[CONST_TITLES.UNDERSOLDED_COST])
            const costB = handleFormatNumber(rowB[CONST_TITLES.UNDERSOLDED_COST])

            return costA - costB;
        },

        render: row => {
            const cost = formatNumber(
                row[CONST_TITLES.UNDERSOLDED_COST]
            );

            return cost ? `${cost} р.` : "-";
        },
    },

    {
        title: "Жёсткость",
        key: CONST_TITLES.HARDNESS,
        width: 50,
        resizable: true,
        filterMultiple: true,
        filter: createFilter(
            CONST_TITLES.HARDNESS
        ),
        filterOptions: getUniqueValues(
            CONST_TITLES.HARDNESS
        ),

        sorter: (rowA, rowB) =>
            (toTimestamp(rowA?.[CONST_TITLES.DELIVERY_DATE]) ?? 0) -
            (toTimestamp(rowB?.[CONST_TITLES.DELIVERY_DATE]) ?? 0),

        render: row => {
            const days =
                row[CONST_TITLES.DAYS_SINCE_DELIVERY];

            const hardness =
                row[CONST_TITLES.HARDNESS];

            return h(
                "div",
                {
                    class: "hardness-cell",
                },
                [
                    h(
                        "span",
                        {
                            class: "hardness-value",
                            style: {
                                color: getHardnessColor(days),
                            },
                        },
                        hardness || "-"
                    ),
                    h("br"),
                    h(
                        "span",
                        {
                            class: "hardness-days",
                        },
                        `(${days ?? 0} ${setDaysText(days)})`
                    ),
                ]
            );
        },
    },

    {
        title: "Остатки",
        key: CONST_TITLES.REMAINDER_BOXES_1C,
        width: 40,
        resizable: true,

        sorter: (rowA, rowB) => {
            return (
                handleFormatNumber(rowA[CONST_TITLES.REMAINDER_BOXES_1C]) -
                handleFormatNumber(rowB[CONST_TITLES.REMAINDER_BOXES_1C])
            )  
        },
        render: row => {
            const remainder = trimTrailingZeros(
                row[CONST_TITLES.REMAINDER_BOXES_1C]
            );

            return remainder
                ? `${remainder} кор.`
                : "-";
        },
    },

    {
        type: "expand",
        width: 38,
        expandable: row =>
            getAdditionalFields(row).length > 0,

        renderExpand: row =>
            h(InterchangeableAdditionalInfo, {
                fields: getAdditionalFields(row),
            }),
    },
]);

const clearFilters = () => {
    searchQuery.value = "";
    debouncedSearchQuery.value = "";

    tableRef.value?.clearFilters();
    tableRef.value?.clearSorter();
};

const handlePageChange = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

</script>

<template>
    <div class="result-container">
        <div
            v-if="filteredActualResultObjs.length"
            class="container-result"
        >
            <Transition name="client-demand">
                <InterchangeableClientDemand
                    v-if="
                        clientsDemand &&
                            Object.keys(clientsDemand).length
                    "
                    :clients-demand="clientsDemand"
                />
            </Transition>

            <div class="table-toolbar">
                <NSpace
                    align="center"
                    justify="space-between"
                    :wrap="true"
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

                    <NSpace
                        align="center"
                        :size="6"
                    >
                        <span class="result-count">
                            Найдено: {{ searchedData.length }}
                        </span>

                        <NButton
                            dashed
                            size="small"
                            class="clear-button"
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
                :data="searchedData"
                :bordered="false"
                :single-line="false"
                :single-column="false"
                :striped="true"
                :scroll-x="1016"
                :row-key="rowKey"
                table-layout="fixed"
                :pagination="{
                    pageSize: 35,
                    showSizePicker: false,
                    showQuickJumper: false,
                }"
                @update:page="handlePageChange"
            />
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
    width: 400px;
    font-size: 12px;
}

.result-count {
    color: #85827b;
    font-size: 11px;
    line-height: 1;
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

.hardness-value {
    font-size: 11px;
    font-weight: 700;
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

:deep(.result-table) {
    min-height: calc(100vh - 220px);
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

:deep(.nomenclature-value) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
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