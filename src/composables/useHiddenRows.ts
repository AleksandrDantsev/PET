
import { computed, onMounted, ref, watch } from "vue";
import type { DataObject } from "@/types/TableSheetData.ts";
import { LocalStorage } from "@/utils/localStorage.ts";
import { normalize } from "@/utils/normalize";
import {
    CONST_TITLES,
    HIDDEN_ROWS_STORAGE_KEY,
} from "@/configs/CONFIG_CONST.ts";

export type HiddenRowsMode = "all" | "visible" | "hidden";

export const useHiddenRows = (
    getClientsDemand: () => DataObject | null,
    getTableData: () => DataObject[],
) => {
    const hiddenRows = ref<Set<string>>(new Set());

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

    onMounted(() => {
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

    watch(hiddenRows, rows => {
        LocalStorage.save(
            HIDDEN_ROWS_STORAGE_KEY,
            [...rows],
        );
    });

    return {
        hiddenRows,
        hiddenRowsMode,
        hiddenRowsOptions,
        hiddenRowsCount,
        getHiddenKey,
        toggleHidden,
    };
};
