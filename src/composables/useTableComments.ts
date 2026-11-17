
import { onMounted, ref } from "vue";
import type { DataObject } from "@/types/TableSheetData.ts";
import { LocalStorage } from "@/utils/localStorage.ts";
import { normalize, capitalize } from "@/utils/normalize";
import {
    CONST_TITLES,
    COMMENTS_STORAGE_KEY,
    ADDITIONAL_COMMENTS_STORAGE_KEY,
} from "@/configs/CONFIG_CONST.ts";

type CommentField = "comment" | "additionalComment";

type GeneralComments = Record<string, string>;
type ClientComments = Record<string, string>;

export const useTableComments = (
    getClientsDemand: () => DataObject | null,
) => {
    const rowComments = ref<GeneralComments>({});
    const additionalComments = ref<ClientComments>({});
    const draftComments = ref<Record<string, string>>({});

    const getNomenclature = (row: DataObject): string => {
        return String(row[CONST_TITLES.ONE_C_NOMENCLATURE] || "");
    };

    const getGeneralCommentKey = (row: DataObject): string => {
        return normalize(getNomenclature(row));
    };

    const getClientCommentKey = (row: DataObject): string => {
        const client = normalize(
            getClientsDemand()?.[CONST_TITLES.CONTRAGENT],
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
            LocalStorage.save(COMMENTS_STORAGE_KEY, nextComments);
        } else {
            const nextComments = { ...additionalComments.value };

            if (comment) {
                nextComments[key] = comment;
            } else {
                delete nextComments[key];
            }

            additionalComments.value = nextComments;
            LocalStorage.save(
                ADDITIONAL_COMMENTS_STORAGE_KEY,
                nextComments,
            );
        }

        const nextDrafts = { ...draftComments.value };
        delete nextDrafts[draftKey];
        draftComments.value = nextDrafts;
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

            LocalStorage.save(COMMENTS_STORAGE_KEY, general);
            LocalStorage.save(
                ADDITIONAL_COMMENTS_STORAGE_KEY,
                clientSpecific,
            );
        } catch (error) {
            console.error("Не удалось загрузить комментарии:", error);
            rowComments.value = {};
            additionalComments.value = {};
        }
    });

    return {
        rowComments,
        additionalComments,
        draftComments,
        getStoredComment,
        getDraftComment,
        updateDraftComment,
        saveComment,
    };
};
