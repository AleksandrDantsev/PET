<script setup lang="ts">
import { computed, h, ref, onMounted, watch } from "vue";
import {
    NButton,
    NDataTable,
    NInput,
    NSpace,
    NPopconfirm,
    type DataTableColumns,
    type DataTableInst,
} from "naive-ui";
import type { DataObject } from "@/types/TableSheetData.ts";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { getHardnessColor, getProductColor } from "@/utils/colorHelpers.ts";
import HideEyeIcon from "@/components/icons/HideEyeIcon.vue";
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

type HiddenRowsMode = "all" | "visible" | "hidden";

type HiddenRow = {
    nomenclature: string;
    comment: string;
};

type HiddenRows = Record<string, HiddenRow[]>;
const COMMENTS_STORAGE_KEY = "interchangeable-row-comments";
const rowComments = ref<HiddenRows>({});


const activeFilters = ref<
    Record<string, (string | number)[] | string | number | null>>({});

const tableRef = ref<DataTableInst | null>(null);
const debouncedSearchQuery = ref(searchQuery.value);
const sortingByPriorityField = ref("");
const hiddenRowsMode = ref<HiddenRowsMode>("visible");

const hiddenRowsOptions: {
    label: string;
    value: HiddenRowsMode;
}[] = [
    { label: "Все", value: "all" },
    { label: "Без скрытых", value: "visible" },
    { label: "Только скрытые", value: "hidden" },
];

const { copy } = useCopyToClipboard();

const updateSearchQuery = debounce((value: string) => {
    debouncedSearchQuery.value = value;
}, 500);



const includedFieldsInAdditionalSector = [
    CONST_TITLES.NUMBER_TASK_BITRIX,
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
    CONST_TITLES.NUMBER_TASK_BITRIX,
];

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
        label: "Другой менеджер / другой клиент",
        value: "anotherManagerAnotherClient",
    },
];

const HIDDEN_ROWS_STORAGE_KEY = "interchangeable-hidden-rows";

const hiddenRows = ref<Set<string>>(new Set());

const getRowClassName = (row: DataObject) => {
    const hasClientDemand = Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length
    );

    if (!hasClientDemand) {
        return "";
    }

    return hiddenRows.value.has(getHiddenKey(row))
        ? "hidden-row"
        : "";
};

onMounted(() => {
    try {
        const saved = localStorage.getItem(HIDDEN_ROWS_STORAGE_KEY);

        if (saved) {
            hiddenRows.value = new Set(JSON.parse(saved));
        }
    } catch {
        hiddenRows.value = new Set();
    }

    try {
        const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);

        if (savedComments) {
            rowComments.value = JSON.parse(savedComments);
        }
    } catch {
        rowComments.value = {};
    }
});

watch(hiddenRows, rows => {
    localStorage.setItem(
        HIDDEN_ROWS_STORAGE_KEY,
        JSON.stringify([...rows]),
    );
});

const getClientKey = (row: DataObject): string => {
    return String(row[CONST_TITLES.CURRENT_CLIENT] || "allHidden");
};

const getNomenclature = (row: DataObject): string => {
    return String(row[CONST_TITLES.ONE_C_NOMENCLATURE] || "");
};

const getCommentKey = (row: DataObject): string => {
    return JSON.stringify([
        getClientKey(row),
        getNomenclature(row),
    ]);
};

const getHiddenKey = (row: DataObject): string => {
    return JSON.stringify([
        getClientKey(row),
        getNomenclature(row),
    ]);
};

const getComment = (row: DataObject): string => {
    const clientKey = getClientKey(row);
    const nomenclature = getNomenclature(row);

    return rowComments.value[clientKey]?.find(
        item => item.nomenclature === nomenclature
    )?.comment ?? "";
};

const draftComments = ref<Record<string, string>>({});

const getDraftComment = (row: DataObject): string => {
    const key = getCommentKey(row);

    return draftComments.value[key] ?? getComment(row);
};

const updateDraftComment = (row: DataObject, comment: string) => {
    draftComments.value = {
        ...draftComments.value,
        [getCommentKey(row)]: comment,
    };
};

const saveComment = (row: DataObject) => {
    const clientKey = getClientKey(row);
    const nomenclature = getNomenclature(row);
    const key = getCommentKey(row);
    const comment = draftComments.value[key] ?? getComment(row);

    if (!nomenclature) return;

    const clientRows = [...(rowComments.value[clientKey] ?? [])];
    const index = clientRows.findIndex(
        item => item.nomenclature === nomenclature
    );

    if (index === -1) {
        if (comment) {
            clientRows.push({ nomenclature, comment });
        }
    } else if (comment) {
        clientRows[index] = { nomenclature, comment };
    } else {
        clientRows.splice(index, 1);
    }

    const nextComments = { ...rowComments.value };

    if (clientRows.length) {
        nextComments[clientKey] = clientRows;
    } else {
        delete nextComments[clientKey];
    }

    localStorage.setItem(
        COMMENTS_STORAGE_KEY,
        JSON.stringify(nextComments)
    );

    rowComments.value = nextComments;

    const nextDrafts = { ...draftComments.value };
    delete nextDrafts[key];
    draftComments.value = nextDrafts;
};

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
    return includedFieldsInAdditionalSector
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

const displayedData = computed(() => {
    const data = searchedData.value;
    const demand = props.clientsDemand;
    const mode = sortingByPriorityField.value;

    if (!demand || !mode) {
        return data;
    }

    const demandManager = normalize(
        demand[CONST_TITLES.MANAGER]
    );

    const demandClient = normalize(
        demand[CONST_TITLES.CONTRAGENT]
    );

    return data.filter(row => {
        const rowManager = normalize(
            row[CONST_TITLES.RESPONSIBLE_MANAGER]
        );

        const rowClient = normalize(
            row[CONST_TITLES.CURRENT_CLIENT]
        );

        const sameManager = Boolean(demandManager && rowManager)
            && demandManager === rowManager;

        const sameClient = Boolean(demandClient && rowClient)
            && demandClient === rowClient;

        switch (mode) {
        case "sameManagerSameClient":
            return sameManager && sameClient;

        case "sameManagerAnotherClient":
            return sameManager && !sameClient;

        case "anotherManagerAnotherClient":
            return !sameManager && !sameClient;

        default:
            return true;
        }
    });
});

const rowKey = (row: DataObject) => JSON.stringify(row);

const toggleHidden = (row: DataObject) => {
    const key = getHiddenKey(row);
    const next = new Set(hiddenRows.value);

    if (next.has(key)) {
        next.delete(key);
    } else {
        next.add(key);
    }

    hiddenRows.value = next;
};

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

            return h("div", { class: "nomenclature-cell" }, 
                [
                    props.clientsDemand && Object.keys(props.clientsDemand).length
                        ? h(
                            NPopconfirm,
                            {
                                positiveText: hiddenRows.value.has(getHiddenKey(row))
                                    ? "Показать"
                                    : "Скрыть",
                                negativeText: "Отмена",
                                placement: "top",
                                showIcon: false,
                                onPositiveClick: () => toggleHidden(row),
                            },
                            {
                                trigger: () => h("button", {
                                    class: [
                                        "hide-line",
                                        hiddenRows.value.has(getHiddenKey(row)) &&
                                            "hide-line--active",
                                    ],
                                    title: hiddenRows.value.has(getHiddenKey(row))
                                        ? "Убрать из скрытого"
                                        : "Скрыть",
                                    onClick: (event: MouseEvent) => event.stopPropagation(),
                                }, h(HideEyeIcon)),
                                default: () => hiddenRows.value.has(getHiddenKey(row))
                                    ? "Убрать номенклатуру из скрытых?"
                                    : "Скрыть номенклатуру для этого клиента?",
                            },
                        )
                        : null,
                    h("span", 
                        {
                            class: "product-color",
                            style: { backgroundColor: color },
                        }
                    ),
                    h("span",
                        {
                            class: "nomenclature-value",
                            title: "Нажмите, чтобы скопировать",
                            onClick: () => copy(nomenclature, "Номенклатура скопирована"),
                        },
                        nomenclature || `-`,
                    ),
                ]
            );
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
        width: 120,
        sorter: "default",
        filter: createFilter(
            CONST_TITLES.CURRENT_CLIENT
        ),
        filterMultiple: true,
        filterOptions: getUniqueValues(
            CONST_TITLES.CURRENT_CLIENT
        ),
        resizable: true,

        render: row => {
            const client = row[CONST_TITLES.CURRENT_CLIENT];
            return client ? h(
                "span",
                {
                    class: "client-copyable-text",
                    title: "Нажмите, чтобы скопировать",
                    onClick: () => copy(client, "Клиент скопирован"),
                },
                cutOverflowedText(client, 30)
            ) : h("span", {style: {marginLeft: "10px"}}, `-`);
        },
    },
    {
        title: "Стоимость",
        key: CONST_TITLES.UNDERSOLDED_COST,
        width: 40,
        resizable: true,

        sorter: (rowA, rowB) => {
            return (
                handleFormatNumber(rowA[CONST_TITLES.UNDERSOLDED_COST]) - 
                handleFormatNumber(rowB[CONST_TITLES.UNDERSOLDED_COST])
            )
        },

        render: row => {
            const cost = formatNumber(
                row[CONST_TITLES.UNDERSOLDED_COST]
            );
            return cost ? `${cost} р.` : "-";
        },
    },
    {
        title: "Дата привоза",
        key: CONST_TITLES.DELIVERY_DATE,
        width: 50,

        sorter: (rowA, rowB) =>
            (toTimestamp(rowA?.[CONST_TITLES.DELIVERY_DATE]) ?? 0) -
            (toTimestamp(rowB?.[CONST_TITLES.DELIVERY_DATE]) ?? 0),

        render: (row) => row[CONST_TITLES.DELIVERY_DATE] || "-"
    },
    {
        title: "Жёсткость",
        key: CONST_TITLES.HARDNESS,
        width: 60,
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

            return h("div",
                { class: "hardness-cell" },
                [ 
                    h("span",
                        {
                            class: "hardness-value",
                            style: {color: getHardnessColor(days)},
                        }, hardness || "-"),
                    h("br"),
                    h("span",
                        {class: "hardness-days"},
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
            return remainder ? `${remainder} кор.` : "-";
        },
    },

    {
        title: "Недопрод.",
        key: CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW,
        width: 40,
        resizable: true,

        sorter: (rowA, rowB) => {
            return (
                handleFormatNumber(rowA[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW]) -
                handleFormatNumber(rowB[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW])
            )  
        },

        render: row => {
            const remainder = trimTrailingZeros(
                row[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW]
            );
            return remainder ? `${remainder} кор.` : "-";
        },
    },

    {
        type: "expand",
        width: 20,
        expandable: () => true,

        renderExpand: row =>
            h("div", { class: "expanded-row-content" }, [
                h("div", { class: "row-comment" }, [
                    h("div", { class: "row-comment-control" }, [
                        h(NInput, {
                            value: getDraftComment(row),
                            size: "small",
                            placeholder: "Добавить комментарий...",
                            type: "textarea",
                            autosize: { minRows: 1, maxRows: 4 },
                            class: "row-comment-input",
                            onUpdateValue: (value: string) => {
                                updateDraftComment(row, value);
                            },
                        }),

                        h(NButton, {
                            size: "small",
                            type: "primary",
                            class: "row-comment-save",
                            disabled: getDraftComment(row) === getComment(row),
                            onClick: () => saveComment(row),
                        }, {
                            default: () => "Сохранить",
                        }),
                    ]),
                    h(InterchangeableAdditionalInfo, {
                        fields: getAdditionalFields(row),
                    }),
                ]),
            ]),
    },
]);

const handleUpdateFilters = (
    filters: Record<string, (string | number)[] | string | number | null>
) => {
    activeFilters.value = filters;
};

const filterableKeys = [
    CONST_TITLES.ONE_C_NOMENCLATURE,
    CONST_TITLES.RESPONSIBLE_MANAGER,
    CONST_TITLES.BRANCH,
    CONST_TITLES.CURRENT_CLIENT,
    CONST_TITLES.HARDNESS,
];

const displayedCount = computed(() => {
    return visibleData.value.filter(row => {
        return filterableKeys.every(key => {
            const selectedValues = activeFilters.value[key];

            if (
                selectedValues == null ||
                (Array.isArray(selectedValues) &&
                    selectedValues.length === 0)
            ) {
                return true;
            }
            const values = Array.isArray(selectedValues)
                ? selectedValues
                : [selectedValues];

            return values.some(value => createFilter(key)(value, row));
        });
    }).length;
});

const visibleData = computed(() => {
    const hasClientDemand = Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length
    );

    return displayedData.value.filter(row => {
        const isHidden = hiddenRows.value.has(getHiddenKey(row));

        // Без активного подбора не применяем сохранённые исключения
        if (!hasClientDemand) {
            return true;
        }

        // При подборе учитываем выбранный режим отображения
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

const clearFilters = () => {
    searchQuery.value = "";
    debouncedSearchQuery.value = "";

    tableRef.value?.clearFilters();
    tableRef.value?.clearSorter();

    activeFilters.value = {};
    sortingByPriorityField.value = "";
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
                            v-if="clientsDemand && Object.keys(clientsDemand).length"
                            class="triple-toggle"
                        >
                            <button
                                v-for="(option, index) in hiddenRowsOptions"
                                :key="option.value"
                                :class="{ active: hiddenRowsMode === option.value }"
                                @click="hiddenRowsMode = option.value"
                            >
                                {{ option.label }}
                            </button>
                        </div>
                    </NSpace>

                    <NSpace
                        v-if="clientsDemand && Object.keys(clientsDemand).length"
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
                            Найдено: {{ displayedCount }}
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
                :data="visibleData"
                :bordered="false"
                :single-line="false"
                :single-column="false"
                :striped="true"
                :scroll-x="1016"
                :row-key="rowKey"
                table-layout="fixed"
                :row-class-name="getRowClassName"
                :pagination="{
                    pageSize: 35,
                    showSizePicker: false,
                    showQuickJumper: false,
                }"
                @update:page="scrollPageToTop"
                @update:filters="handleUpdateFilters"
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
    border-radius: none;
    height: auto;
    font-size: 12px;
}
.row-comment-save:disabled {
    opacity: 0.55;
}
:deep(.hidden-row td) {
    opacity: 0.5;
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

:deep(.hide-line) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    background-color: transparent;
    color: #a0a0a0;
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

@mixin copyable-text {
    padding: 4px 10px;
    background-color: #fafafa;
    border-radius: 7px;
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