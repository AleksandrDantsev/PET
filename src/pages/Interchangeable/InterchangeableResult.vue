
<script setup lang="ts">
import { computed, h, ref, onMounted, watch } from "vue";
import {
    NButton,
    NDataTable,
    NInput,
    NSpace,
    NPopconfirm,
    NEmpty,
    NBadge,
    NTooltip,
    type DataTableColumns,
    type DataTableInst,
} from "naive-ui";
import type { DataObject } from "@/types/TableSheetData.ts";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { getHardnessColor, getProductColor } from "@/utils/colorHelpers.ts";
import HideEyeIcon from "@/components/icons/HideEyeIcon.vue";
import CommentIcon from "@/components/icons/CommentIcon.vue";
import {
    cutOverflowedText,
    formatCost,
    normalize,
    setDaysText,
    trimTrailingZeros,
    handleFormatNumber,
    toTimestamp,
    capitalize,
} from "@/utils/normalize";
import { debounce } from "@/utils/debounce";
import InterchangeableClientDemand from "./InterchangeableClientDemand.vue";
import InterchangeableAdditionalInfo from "./InterchangeableAdditionalInfo.vue";
import { 
    CONST_TITLES,
    COMMENTS_STORAGE_KEY,
    ADDITIONAL_COMMENTS_STORAGE_KEY,
    HIDDEN_ROWS_STORAGE_KEY,
} from "@/configs/CONFIG_CONST.ts";

import DataTableFilter from "./Filters/DataTableFilter.vue";
import {
    createDefaultFilter,
    matchesTableFilters,
    type FilterColumnConfig,
    type TableFilterState,
} from "@/composables/useTableFilters";
import type { FilterType, ColumnFilter } from "./Filters/DataTableFilter.vue";

const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
    searchedFields: Record<string, string | number | null> | null;
}>();

const tableData = computed(() => props.filteredActualResultObjs);

const searchQuery = defineModel<string>("searchQuery", {
    default: "",
});

type HiddenRowsMode = "all" | "visible" | "hidden";
type CommentField = "comment" | "additionalComment";

type GeneralComments = Record<string, string>;
type ClientComments = Record<string, string>;

const PAGINATION_LENGTH = 30;
const currentPage = ref(1);



const rowComments = ref<GeneralComments>({});
const additionalComments = ref<ClientComments>({});
const draftComments = ref<Record<string, string>>({});
const hiddenRows = ref<Set<string>>(new Set());

const tableFilters = ref<TableFilterState>({});

const filterConfigs: FilterColumnConfig[] = [
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

const updateTableFilter = (key: string, value: ColumnFilter) => {
    tableFilters.value = {
        ...tableFilters.value,
        [key]: value,
    };
};

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
    { label: "Скрытые", value: "hidden" },
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
    CONST_TITLES.DATE_NEXT_ACTION,
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
    CONST_TITLES.DATE_NEXT_ACTION,
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

const getUniqueValues = (key: string) => {
    return [
        ...new Set(
            tableData.value
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

const saveToLocalStorage = (key: string, value: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(
            `Не удалось сохранить данные в localStorage (${key}):`,
            error,
        );
    }
};

const getNomenclature = (row: DataObject): string => {
    return String(row[CONST_TITLES.ONE_C_NOMENCLATURE] || "");
};

const getGeneralCommentKey = (row: DataObject): string => {
    return normalize(getNomenclature(row));
};

const getClientCommentKey = (row: DataObject): string => {
    const client = normalize(
        props.clientsDemand?.[CONST_TITLES.CONTRAGENT],
    );

    return JSON.stringify([
        client,
        normalize(getNomenclature(row)),
    ]);
};

const getHiddenKey = (row: DataObject): string => {
    const client = normalize(
        props.clientsDemand?.[CONST_TITLES.CONTRAGENT],
    );

    return JSON.stringify([
        client,
        normalize(getNomenclature(row)),
    ]);
};

const getStoredComment = (
    row: DataObject,
    field: CommentField,
): string => {
    if (field === "comment") {
        return rowComments.value[getGeneralCommentKey(row)] ?? "";
    }

    return additionalComments.value[getClientCommentKey(row)] ?? "";
};

const getDraftKey = (
    row: DataObject,
    field: CommentField,
): string => {
    const commentKey = field === "comment"
        ? getGeneralCommentKey(row)
        : getClientCommentKey(row);

    return JSON.stringify([commentKey, field]);
};

const getDraftComment = (
    row: DataObject,
    field: CommentField,
): string => {
    const key = getDraftKey(row, field);

    return draftComments.value[key] ?? getStoredComment(row, field);
};

const updateDraftComment = (
    row: DataObject,
    field: CommentField,
    value: string,
) => {
    const key = getDraftKey(row, field);

    draftComments.value[key] = value;
};

const saveComment = (
    row: DataObject,
    field: CommentField,
) => {
    const nomenclature = getNomenclature(row);

    if (!nomenclature) return;

    const key = field === "comment"
        ? getGeneralCommentKey(row)
        : getClientCommentKey(row);

    const draftKey = getDraftKey(row, field);
    const comment = capitalize(getDraftComment(row, field)).trim();

    if (field === "comment") {
        const nextComments = { ...rowComments.value };

        if (comment) {
            nextComments[key] = comment;
        } else {
            delete nextComments[key];
        }

        rowComments.value = nextComments;
        saveToLocalStorage(COMMENTS_STORAGE_KEY, nextComments);
    } else {
        const nextComments = { ...additionalComments.value };

        if (comment) {
            nextComments[key] = comment;
        } else {
            delete nextComments[key];
        }

        additionalComments.value = nextComments;
        saveToLocalStorage(
            ADDITIONAL_COMMENTS_STORAGE_KEY,
            nextComments,
        );
    }

    const nextDrafts = { ...draftComments.value };
    delete nextDrafts[draftKey];
    draftComments.value = nextDrafts;
};

const isSearchedMatch = (row: DataObject): boolean => {
    console.log(props.searchedFields)
    
    const searchedNomenclature = normalize(
        String(props.searchedFields?.nomenclature)
    );

    const searchedClient = normalize(
        String(props.searchedFields?.contragent)
    );

    if (!searchedNomenclature || !searchedClient) {
        return false;
    }

    return (
        normalize(row[CONST_TITLES.ONE_C_NOMENCLATURE]) ===
            searchedNomenclature &&
        normalize(row[CONST_TITLES.CURRENT_CLIENT]) ===
            searchedClient
    );
};

const getRowClassName = (row: DataObject): string => {
    const classes: string[] = [];

    if (isSearchedMatch(row)) {
        classes.push("searched-match-row");
    }

    const hasClientDemand = Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length
    );

    if (hasClientDemand && hiddenRows.value.has(getHiddenKey(row))) {
        classes.push("hidden-row");
    }

    return classes.join(" ");
};

onMounted(() => {
    try {
        const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
        const savedAdditionalComments = localStorage.getItem(
            ADDITIONAL_COMMENTS_STORAGE_KEY,
        );

        const general: GeneralComments = {};
        const clientSpecific: ClientComments = {};

        if (savedComments) {
            const parsed: Record<string, unknown> = JSON.parse(savedComments);

            Object.entries(parsed).forEach(([key, value]) => {
                if (typeof value === "string") {
                    general[key] = value;
                    return;
                }

                if (!Array.isArray(value)) return;

                value.forEach((item: {
                    nomenclature?: string;
                    comment?: string;
                    additionalComment?: string;
                }) => {
                    if (!item?.nomenclature) return;

                    const nomenclatureKey = normalize(item.nomenclature);

                    if (item.comment?.trim()) {
                        general[nomenclatureKey] = item.comment;
                    }

                    if (item.additionalComment?.trim()) {
                        const clientKey = JSON.stringify([
                            normalize(key),
                            nomenclatureKey,
                        ]);

                        clientSpecific[clientKey] = item.additionalComment;
                    }
                });
            });
        }

        if (savedAdditionalComments) {
            const parsed: Record<string, unknown> = JSON.parse(
                savedAdditionalComments,
            );

            Object.entries(parsed).forEach(([key, value]) => {
                if (typeof value === "string") {
                    clientSpecific[key] = value;
                    return;
                }

                if (!Array.isArray(value)) return;

                value.forEach((item: {
                    nomenclature?: string;
                    comment?: string;
                }) => {
                    if (!item?.nomenclature || !item.comment?.trim()) return;

                    const clientKey = JSON.stringify([
                        normalize(key),
                        normalize(item.nomenclature),
                    ]);

                    clientSpecific[clientKey] = item.comment;
                });
            });
        }

        rowComments.value = general;
        additionalComments.value = clientSpecific;

        saveToLocalStorage(COMMENTS_STORAGE_KEY, general);
        saveToLocalStorage(
            ADDITIONAL_COMMENTS_STORAGE_KEY,
            clientSpecific,
        );
    } catch (error) {
        console.error("Не удалось загрузить комментарии:", error);
        rowComments.value = {};
        additionalComments.value = {};
    }

    try {
        const savedHiddenRows = localStorage.getItem(
            HIDDEN_ROWS_STORAGE_KEY,
        );

        if (savedHiddenRows) {
            hiddenRows.value = new Set(
                JSON.parse(savedHiddenRows) as string[],
            );
        }
    } catch (error) {
        console.error("Не удалось загрузить скрытые позиции:", error);
        hiddenRows.value = new Set();
    }
});

const hiddenRowsCount = computed(() => {
    const uniqueKeys = new Set<string>();

    tableData.value.forEach(row => {
        const key = getHiddenKey(row);

        if (hiddenRows.value.has(key)) {
            uniqueKeys.add(key);
        }
    });

    return uniqueKeys.size;
});

watch(hiddenRows, rows => {
    saveToLocalStorage(
        HIDDEN_ROWS_STORAGE_KEY,
        [...rows],
    );
});

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

    if (!query) return tableData.value;

    return tableData.value.filter(row =>
        searchableFields.some(key =>
            normalize(row[key]).includes(query),
        ),
    );
});

const displayedData = computed(() => {
    const data = searchedData.value;
    const demand = props.clientsDemand;
    const mode = sortingByPriorityField.value;

    let filteredData = data;

    if (demand && mode) {
        const demandManager = normalize(
            demand[CONST_TITLES.MANAGER]
        );

        const demandClient = normalize(
            demand[CONST_TITLES.CONTRAGENT]
        );

        filteredData = data.filter(row => {
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
    }

    return [...filteredData].sort(
        (a, b) => Number(isSearchedMatch(b)) - Number(isSearchedMatch(a))
    );
});

const filteredByColumns = computed(() => {
    return displayedData.value.filter(row =>
        matchesTableFilters(
            row,
            filterConfigs,
            tableFilters.value,
            allFilterValues.value,
            filterDefaults.value,
        ),
    );
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

const renderFilterTitle = (
    key: string,
    title: string,
    type: FilterType,
) => {
    return () => h(DataTableFilter, {
        title,
        type,
        options: getUniqueValues(key),
        defaultValues: filterDefaults.value[key] ?? [],
        modelValue: getTableFilter(key),
        "onUpdate:modelValue": (value: ColumnFilter) => {
            updateTableFilter(key, value);
        },
    });
};

const columns = computed<DataTableColumns<DataObject>>(() => [
    {
        title: "№",
        key: "index",
        width: 18,
        align: "center",
        render: (_row, index) =>
            (currentPage.value - 1) * PAGINATION_LENGTH + index + 1,
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.ONE_C_NOMENCLATURE,
            "Номенклатура",
            "text",
        ),
        key: CONST_TITLES.ONE_C_NOMENCLATURE,
        width: 120,
        sorter: "default",
        resizable: true,

        render: row => {
            const nomenclature =
                row[CONST_TITLES.ONE_C_NOMENCLATURE];

            const color = getProductColor(
                nomenclature as string | undefined,
            );

            const isHidden = hiddenRows.value.has(getHiddenKey(row));

            return h("div", { class: "nomenclature-cell" }, [
                props.clientsDemand && Object.keys(props.clientsDemand).length
                    ? h(
                        NPopconfirm,
                        {
                            positiveText: isHidden ? "Показать" : "Скрыть",
                            negativeText: "Отмена",
                            placement: "top",
                            showIcon: false,
                            onPositiveClick: () => toggleHidden(row),
                        },
                        {
                            trigger: () => h(
                                "button",
                                {
                                    class: [
                                        "hide-line",
                                        isHidden && "hide-line--active",
                                    ],
                                    title: isHidden
                                        ? "Убрать из скрытого"
                                        : "Скрыть",
                                    onClick: (event: MouseEvent) =>
                                        event.stopPropagation(),
                                },
                                h(HideEyeIcon),
                            ),
                            default: () => isHidden
                                ? "Убрать номенклатуру из скрытых?"
                                : "Скрыть номенклатуру для этого клиента?",
                        },
                    )
                    : null,
                h("span", {
                    class: "product-color",
                    style: { backgroundColor: color },
                }),
                h(
                    "span",
                    {
                        class: "nomenclature-value",
                        title: nomenclature,
                        onClick: () => copy(
                            nomenclature,
                            "Номенклатура скопирована",
                        ),
                    },
                    nomenclature || "-",
                ),
            ]);
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.RESPONSIBLE_MANAGER,
            "Менеджер",
            "text",
        ),
        key: CONST_TITLES.RESPONSIBLE_MANAGER,
        width: 50,
        sorter: "default",
        resizable: true,
        render: row => row[CONST_TITLES.RESPONSIBLE_MANAGER] || "-",
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.BRANCH,
            "Филиал",
            "text",
        ),
        key: CONST_TITLES.BRANCH,
        width: 45,
        sorter: "default",
        resizable: true,
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.CURRENT_CLIENT,
            "Клиент",
            "text",
        ),
        key: CONST_TITLES.CURRENT_CLIENT,
        width: 115,
        sorter: "default",
        resizable: true,

        render: row => {
            const client = row[CONST_TITLES.CURRENT_CLIENT];

            const unsuitableComment = getStoredComment(
                row,
                "additionalComment",
            ).trim();

            const nomenclatureComment = getStoredComment(
                row,
                "comment",
            ).trim();

            const hasClientDemand = Boolean(
                props.clientsDemand &&
                Object.keys(props.clientsDemand).length,
            );

            const createCommentIcon = (
                comment: string,
                type: "unsuitable" | "nomenclature",
            ) => h(
                NTooltip,
                {
                    placement: "top",
                    trigger: "hover",
                },
                {
                    trigger: () => h(
                        "span",
                        {
                            class: "comment-icon-wrapper",
                        },
                        [
                            h(CommentIcon, {
                                class: [
                                    "comment-icon",
                                    `comment-icon--${type}`,
                                    comment
                                        ? "comment-icon--active"
                                        : "comment-icon--empty",
                                ],
                            }),
                        ],
                    ),
                    default: () => comment || "Комментарий отсутствует",
                },
            );

            return h("div", { class: "client-cell" }, [
                hasClientDemand
                    ? createCommentIcon(
                        unsuitableComment,
                        "unsuitable",
                    )
                    : null,

                createCommentIcon(
                    nomenclatureComment,
                    "nomenclature",
                ),

                client
                    ? h(
                        "span",
                        {
                            class: "client-copyable-text",
                            title: client,
                            onClick: () => copy(
                                client,
                                "Клиент скопирован",
                            ),
                        },
                        cutOverflowedText(client, 30),
                    )
                    : h("span", "-"),
            ]);
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.UNDERSOLDED_COST,
            "Стоимость",
            "number",
        ),
        key: CONST_TITLES.UNDERSOLDED_COST,
        width: 45,
        resizable: true,
        sorter: (rowA, rowB) =>
            handleFormatNumber(rowA[CONST_TITLES.UNDERSOLDED_COST]) -
            handleFormatNumber(rowB[CONST_TITLES.UNDERSOLDED_COST]),
        render: row => {
            const cost = formatCost(
                row[CONST_TITLES.UNDERSOLDED_COST],
            );

            return cost ? `${cost} р.` : "-";
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.DELIVERY_DATE,
            "Дата привоза",
            "date",
        ),
        key: CONST_TITLES.DELIVERY_DATE,
        width: 50,
        sorter: (rowA, rowB) =>
            (toTimestamp(rowA?.[CONST_TITLES.DELIVERY_DATE]) ?? 0) -
            (toTimestamp(rowB?.[CONST_TITLES.DELIVERY_DATE]) ?? 0),
        render: row => row[CONST_TITLES.DELIVERY_DATE] || "-",
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP,
            "Жесткость",
            "text",
        ),
        key: CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP,
        width: 60,
        resizable: true,
        sorter: (rowA, rowB) =>
            (toTimestamp(rowA?.[CONST_TITLES.DELIVERY_DATE]) ?? 0) -
            (toTimestamp(rowB?.[CONST_TITLES.DELIVERY_DATE]) ?? 0),
        render: row => {
            const days = row[CONST_TITLES.DAYS_SINCE_DELIVERY];
            const hardness = row[CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP];

            return h("div", { class: "hardness-cell" }, [
                h(
                    "span",
                    {
                        class: "hardness-value",
                        style: { color: getHardnessColor(days) },
                    },
                    hardness || "-",
                ),
                h("br"),
                h(
                    "span",
                    { class: "hardness-days" },
                    `(${days ?? 0} ${setDaysText(days)})`,
                ),
            ]);
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.REMAINDER_BOXES_1C,
            "Остатки",
            "number",
        ),
        key: CONST_TITLES.REMAINDER_BOXES_1C,
        width: 40,
        resizable: true,
        sorter: (rowA, rowB) =>
            handleFormatNumber(rowA[CONST_TITLES.REMAINDER_BOXES_1C]) -
            handleFormatNumber(rowB[CONST_TITLES.REMAINDER_BOXES_1C]),
        render: row => {
            const remainder = trimTrailingZeros(
                row[CONST_TITLES.REMAINDER_BOXES_1C],
            );

            return Number(remainder) !== 0 ? `${remainder} кор.` : "-";
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW,
            "Недопрод.",
            "number",
        ),
        key: CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW,
        width: 40,
        resizable: true,
        sorter: (rowA, rowB) =>
            handleFormatNumber(
                rowA[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW],
            ) -
            handleFormatNumber(
                rowB[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW],
            ),
        render: row => {
            const remainder = trimTrailingZeros(
                row[CONST_TITLES.UNDERSOLDED_PRODUCT_FOR_NOW],
            );

            return Number(remainder) !== 0 ? `${remainder} кор.` : "-";
        },
    },
    {
        title: renderFilterTitle(
            CONST_TITLES.DATE_NEXT_ACTION,
            "Дата (действ.)",
            "date",
        ),
        key: CONST_TITLES.DATE_NEXT_ACTION,
        width: 50,
        sorter: (rowA, rowB) =>
            (toTimestamp(rowA?.[CONST_TITLES.DATE_NEXT_ACTION]) ?? 0) -
            (toTimestamp(rowB?.[CONST_TITLES.DATE_NEXT_ACTION]) ?? 0),
        render: row => row[CONST_TITLES.DATE_NEXT_ACTION] || "-",
    },
    {
        type: "expand",
        width: 17,
        expandable: () => true,

        renderExpand: row =>
            h("div", { class: "expanded-row-content" }, [
                (props.clientsDemand?.[CONST_TITLES.CONTRAGENT]
                    ? [
                        h("div", { class: "row-comment-control" }, [
                            h(NInput, {
                                value: getDraftComment(row, "additionalComment"),
                                size: "small",
                                placeholder: "Комментарий по позиции для этого клиента...",
                                type: "textarea",
                                autosize: { minRows: 1, maxRows: 4 },
                                class: "row-comment-input",
                                onUpdateValue: (value: string) => {
                                    updateDraftComment(row, "additionalComment", value);
                                },
                            }),
                            h(NButton, {
                                size: "small",
                                type: "primary",
                                class: "row-comment-save button-unsuitable",
                                disabled:
                                    getDraftComment(row, "additionalComment") ===
                                    getStoredComment(row, "additionalComment"),
                                onClick: () => saveComment(row, "additionalComment"),
                            }, {
                                default: () => "Сохранить",
                            }),
                        ]),
                    ]
                    : []),
                h(InterchangeableAdditionalInfo, {
                    fields: getAdditionalFields(row),
                }),
                h(
                    "div",
                    {
                        class: "row-comment-control row-comment-control-bottom",
                    },
                    [
                        h(NInput, {
                            value: getDraftComment(row, "comment"),
                            size: "small",
                            placeholder: "Комментарий по позиции...",
                            type: "textarea",
                            autosize: { minRows: 1, maxRows: 4 },
                            class: "row-comment-input",
                            onUpdateValue: (value: string) => {
                                updateDraftComment(row, "comment", value);
                            },
                        }),
                        h(NButton, {
                            size: "small",
                            type: "primary",
                            class: "row-comment-save",
                            disabled:
                                getDraftComment(row, "comment") ===
                                getStoredComment(row, "comment"),
                            onClick: () => saveComment(row, "comment"),
                        }, {
                            default: () => "Сохранить",
                        }),
                    ],
                ),
            ]),
    },
]);

const visibleData = computed(() => {
    const hasClientDemand = Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length,
    );

    return filteredByColumns.value.filter(row => {
        const isHidden = hiddenRows.value.has(getHiddenKey(row));

        if (!hasClientDemand) return true;

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

const displayedCount = computed(() => visibleData.value.length);


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
                    v-if="
                        clientsDemand &&
                            Object.keys(clientsDemand).length
                    "
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
                            v-if="
                                clientsDemand && 
                                    Object.keys(clientsDemand).length &&
                                    searchedData.length
                            "
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
                        v-if="
                            clientsDemand &&
                                Object.keys(clientsDemand).length &&
                                searchedData.length
                        "
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

:deep(.client-copyable-text) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
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

:deep(.n-data-table .searched-match-row td) {
    background-color: #d6dde7 !important;
    box-shadow: 5px 0px 5px 0 #d5e0ec91;
}

:deep(.n-data-table .searched-match-row td:first-child) {
    box-shadow: inset 2px 0 0 #83a5cc5e;
}

:deep(.n-data-table .searched-match-row:hover td) {
    background-color: #e5e8ece7 !important;
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