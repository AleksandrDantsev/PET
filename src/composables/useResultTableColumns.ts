
import { computed, h } from "vue";
import type { Ref } from "vue";
import "@/styles/result-table-comments.scss";
import type { DataTableColumns } from "naive-ui";
import {
    NInput,
    NPopconfirm,
    NTooltip,
} from "naive-ui";

import type { DataObject } from "@/types/TableSheetData";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import {
    cutOverflowedText,
    formatCost,
    setDaysText,
    trimTrailingZeros,
    handleFormatNumber,
    toTimestamp,
} from "@/utils/normalize";
import { getHardnessColor, getProductColor } from "@/utils/colorHelpers";

import HideEyeIcon from "@/components/icons/HideEyeIcon.vue";
import CommentIcon from "@/components/icons/CommentIcon.vue";
import ProductTestIndicator from "@/components/common/ProductTestIndicator.vue";
import InterchangeableAdditionalInfo from "@/pages/Interchangeable/InterchangeableAdditionalInfo.vue";
import DataTableFilter from "@/pages/Interchangeable/Filters/DataTableFilter.vue";

import type {
    FilterType,
    ColumnFilter,
} from "@/pages/Interchangeable/Filters/DataTableFilter.vue";

import type { useTableComments } from "@/composables/useTableComments";
import type { useHiddenRows } from "@/composables/useHiddenRows";
import type { useTableFilters } from "@/composables/useTableFilters";
import type { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import type { useTableTests } from "@/composables/useTableTests";

type TableComments = Pick<
    ReturnType<typeof useTableComments>,
    | "getStoredComment"
    | "getDraftComment"
    | "updateDraftComment"
    | "saveComment"
>;

type TableHiddenRows = Pick<
    ReturnType<typeof useHiddenRows>,
    | "hiddenRows"
    | "getHiddenKey"
    | "toggleHidden"
>;

type TableFilters = Pick<
    ReturnType<typeof useTableFilters>,
    | "filterDefaults"
    | "getUniqueValues"
    | "getTableFilter"
    | "updateTableFilter"
>;

type TableTests = Pick<
    ReturnType<typeof useTableTests>,
    | "getTests"
    | "addTest"
    | "editTest"
    | "removeTest"
>;

interface UseResultTableColumnsOptions {
    clientsDemand: () => DataObject | null;
    currentPage: Ref<number>;
    paginationLength: number;

    comments: TableComments;
    hiddenRows: TableHiddenRows;
    filters: TableFilters;
    tests: TableTests;

    copy: ReturnType<typeof useCopyToClipboard>["copy"];
}

const INCLUDED_ADDITIONAL_FIELDS = [
    CONST_TITLES.NUMBER_TASK_BITRIX,
    CONST_TITLES.ORDERING_MANAGER,
    CONST_TITLES.UNDERSOLDED_CLIENT,
    CONST_TITLES.REMAINDER_1C,
    CONST_TITLES.UNDERSALE_REASON,
    CONST_TITLES.NEXT_ACTION,
    CONST_TITLES.DATE_NEXT_ACTION,
    CONST_TITLES.ALL_CUSTOMERS_SHIPPED_ITEM_MANAGER,
] as const;

export const useResultTableColumns = (
    options: UseResultTableColumnsOptions,
) => {
    const {
        clientsDemand,
        currentPage,
        paginationLength,
        comments,
        hiddenRows,
        filters,
        tests,
        copy,
    } = options;

    const hasClientDemand = () => {
        const demand = clientsDemand();

        return Boolean(demand && Object.keys(demand).length);
    };

    const {
        getStoredComment,
        getDraftComment,
        updateDraftComment,
        saveComment,
    } = comments;

    const {
        hiddenRows: hiddenRowsSet,
        getHiddenKey,
        toggleHidden,
    } = hiddenRows;

    const {
        filterDefaults,
        getUniqueValues,
        getTableFilter,
        updateTableFilter,
    } = filters;

    // Блокировка повторного сохранения одного комментария
    const savingComments = new Set<string>();

    const saveCommentIfChanged = async (
        row: DataObject,
        type: "comment" | "additionalComment",
    ) => {
        const draft = getDraftComment(row, type);
        const stored = getStoredComment(row, type);

        if (draft === stored) return;

        const saveKey = `${getHiddenKey(row)}:${type}`;

        if (savingComments.has(saveKey)) return;

        savingComments.add(saveKey);

        try {
            await saveComment(row, type);
        } finally {
            savingComments.delete(saveKey);
        }
    };

    const getAdditionalFields = (row: DataObject) =>
        INCLUDED_ADDITIONAL_FIELDS
            .filter(key => {
                const value = row[key];

                return value !== null &&
                    value !== undefined &&
                    value !== "";
            })
            .map(key => ({
                key,
                value: row[key],
            }));

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

    // Индикатор тестирования номенклатуры
    const createTestIndicator = (row: DataObject) =>
        h(ProductTestIndicator, {
            row,
            tests,
        });

    const columns = computed<DataTableColumns<DataObject>>(() => [
        {
            title: "№",
            key: "index",
            width: 18,
            align: "center",
            render: (_row, index) =>
                (currentPage.value - 1) * paginationLength + index + 1,
        },
        {
            title: renderFilterTitle(
                CONST_TITLES.ONE_C_NOMENCLATURE,
                "Номенклатура",
                "text",
            ),
            key: CONST_TITLES.ONE_C_NOMENCLATURE,
            width: 140,
            sorter: "default",
            resizable: true,

            render: row => {
                const nomenclature =
                    row[CONST_TITLES.ONE_C_NOMENCLATURE];

                const color = getProductColor(
                    nomenclature as string | undefined,
                );

                const isHidden = hiddenRowsSet.value.has(
                    getHiddenKey(row),
                );

                return h("div", { class: "nomenclature-cell" }, [
                    hasClientDemand()
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

                    hasClientDemand()
                        ? createTestIndicator(row)
                        : null,
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
            width: 52,
            sorter: "default",
            resizable: true,
            render: row =>
                row[CONST_TITLES.RESPONSIBLE_MANAGER] || "-",
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
                        default: () =>
                            comment || "Комментарий отсутствует",
                    },
                );

                return h("div", { class: "client-cell" }, [
                    hasClientDemand()
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
                handleFormatNumber(
                    rowA[CONST_TITLES.UNDERSOLDED_COST],
                ) -
                handleFormatNumber(
                    rowB[CONST_TITLES.UNDERSOLDED_COST],
                ),
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
            render: row =>
                row[CONST_TITLES.DELIVERY_DATE] || "-",
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
                const hardness =
                    row[CONST_TITLES.HARDNESS_100_DAYS_WITH_SLP];

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
                handleFormatNumber(
                    rowA[CONST_TITLES.REMAINDER_BOXES_1C],
                ) -
                handleFormatNumber(
                    rowB[CONST_TITLES.REMAINDER_BOXES_1C],
                ),
            render: row => {
                const remainder = trimTrailingZeros(
                    row[CONST_TITLES.REMAINDER_BOXES_1C],
                );

                return Number(remainder) !== 0
                    ? `${remainder} кор.`
                    : "-";
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

                return Number(remainder) !== 0
                    ? `${remainder} кор.`
                    : "-";
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
            render: row =>
                row[CONST_TITLES.DATE_NEXT_ACTION] || "-",
        },
        {
            type: "expand",
            width: 17,
            expandable: () => true,

            renderExpand: row =>
                h("div", { class: "expanded-row-content" }, [
                    clientsDemand()?.[CONST_TITLES.CONTRAGENT]
                        ? h("div", { class: "row-comment-control" }, [
                            h(NInput, {
                                value: getDraftComment(
                                    row,
                                    "additionalComment",
                                ),
                                size: "small",
                                placeholder:
                                    "Комментарий по позиции для этого клиента...",
                                type: "textarea",
                                autosize: { minRows: 1, maxRows: 4 },
                                class: "row-comment-input",
                                onUpdateValue: (value: string) => {
                                    updateDraftComment(
                                        row,
                                        "additionalComment",
                                        value,
                                    );
                                },
                                onBlur: () =>
                                    saveCommentIfChanged(
                                        row,
                                        "additionalComment",
                                    ),
                            }),
                            h(
                                "button",
                                {
                                    type: "button",
                                    class: "row-comment-save",
                                    disabled:
                                        getDraftComment(
                                            row,
                                            "additionalComment",
                                        ) ===
                                        getStoredComment(
                                            row,
                                            "additionalComment",
                                        ),
                                    onClick: () =>
                                        saveCommentIfChanged(
                                            row,
                                            "additionalComment",
                                        ),
                                },
                                "Сохранить",
                            ),
                        ])
                        : null,

                    h(InterchangeableAdditionalInfo, {
                        fields: getAdditionalFields(row),
                    }),

                    h(
                        "div",
                        {
                            class:
                                "row-comment-control row-comment-control-bottom",
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
                                    updateDraftComment(
                                        row,
                                        "comment",
                                        value,
                                    );
                                },
                                onBlur: () =>
                                    saveCommentIfChanged(row, "comment"),
                            }),
                            h(
                                "button",
                                {
                                    type: "button",
                                    class: "row-comment-save",
                                    disabled:
                                        getDraftComment(row, "comment") ===
                                        getStoredComment(row, "comment"),
                                    onClick: () =>
                                        saveCommentIfChanged(row, "comment"),
                                },
                                "Сохранить",
                            ),
                        ],
                    ),
                ]),
        },
    ]);

    return {
        columns,
    };
};
