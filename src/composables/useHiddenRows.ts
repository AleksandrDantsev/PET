
import { computed, ref } from "vue";

import type { DataObject } from "@/types/TableSheetData";
import { normalize } from "@/utils/normalize";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import { useUserData } from "@/stores/userDataStore";

export type HiddenRowsMode = "all" | "visible" | "hidden";

export const useHiddenRows = (
    getClientsDemand: () => DataObject | null,
    getTableData: () => DataObject[],
) => {
    const {
        hiddenRows,
        updateHiddenRow,
    } = useUserData();

    const hiddenRowsMode = ref<HiddenRowsMode>("visible");

    const hiddenRowsOptions: {
        label: string;
        value: HiddenRowsMode;
    }[] = [
        { label: "Все", value: "all" },
        { label: "Без скрытых", value: "visible" },
        { label: "Скрытые", value: "hidden" },
    ];

    const getNomenclature = (row: DataObject): string => {
        return String(row[CONST_TITLES.ONE_C_NOMENCLATURE] || "");
    };

    const getHiddenKey = (row: DataObject): string => {
        const client = normalize(
            getClientsDemand()?.[CONST_TITLES.CONTRAGENT],
        );

        return JSON.stringify([
            client,
            normalize(getNomenclature(row)),
        ]);
    };

    const hiddenRowsCount = computed(() => {
        const uniqueKeys = new Set<string>();

        getTableData().forEach(row => {
            const key = getHiddenKey(row);

            if (hiddenRows.value.has(key)) {
                uniqueKeys.add(key);
            }
        });

        return uniqueKeys.size;
    });

    const toggleHidden = async (row: DataObject): Promise<void> => {
        const key = getHiddenKey(row);

        const [contragentKey, nomenclatureKey] = JSON.parse(key) as [
            string,
            string,
        ];

        if (!contragentKey || !nomenclatureKey) {
            console.warn("Не удалось скрыть позицию: отсутствует контрагент или номенклатура");
            return;
        }

        const isHidden = !hiddenRows.value.has(key);

        try {
            await updateHiddenRow(
                contragentKey,
                nomenclatureKey,
                isHidden,
            );
        } catch (error) {
            console.error(
                "Не удалось изменить видимость позиции в Supabase:",
                error,
            );
        }
    };

    return {
        hiddenRows,
        hiddenRowsMode,
        hiddenRowsOptions,
        hiddenRowsCount,
        getHiddenKey,
        toggleHidden,
    };
};
