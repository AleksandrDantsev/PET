
import { ref } from "vue";

import type { DataObject } from "@/types/TableSheetData";
import { normalize, capitalize } from "@/utils/normalize";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import { useUserData } from "@/stores/userDataStore";

type CommentField = "comment" | "additionalComment";

export const useTableComments = (
    getClientsDemand: () => DataObject | null,
    getSearchedNomenclature: () => string | undefined,
) => {
    const {
        generalComments: rowComments,
        clientComments: additionalComments,
        updateGeneralComment,
        updateClientComment,
    } = useUserData();

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
            normalize(getSearchedNomenclature() ?? ""),
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
    ): void => {
        const key = getDraftKey(row, field);

        draftComments.value[key] = value;
    };

    const saveComment = async (
        row: DataObject,
        field: CommentField,
    ): Promise<void> => {
        const nomenclature = getNomenclature(row);

        if (!nomenclature) return;

        const draftKey = getDraftKey(row, field);
        const comment = capitalize(
            getDraftComment(row, field),
        ).trim();

        try {
            if (field === "comment") {
                const nomenclatureKey = getGeneralCommentKey(row);

                await updateGeneralComment(
                    nomenclatureKey,
                    comment,
                );
            } else {
                const contragentKey = normalize(
                    getClientsDemand()?.[CONST_TITLES.CONTRAGENT],
                );

                if (!contragentKey) return;

                await updateClientComment(
                    contragentKey,
                    normalize(getSearchedNomenclature() ?? ""),
                    normalize(nomenclature),
                    comment,
                );
            }

            const nextDrafts = { ...draftComments.value };
            delete nextDrafts[draftKey];

            draftComments.value = nextDrafts;
        } catch (error) {
            console.error(
                "Не удалось сохранить комментарий в Supabase:",
                error,
            );
        }
    };

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
