
import type { DataObject } from "@/types/TableSheetData";
import { normalize } from "@/utils/normalize";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import { useUserData } from "@/stores/userDataStore";


export const useTableTests = (
    getClientsDemand: () => DataObject | null,
) => {
    const {
        tests,
        updateTest,
        deleteTest,
    } = useUserData();

    const getNomenclature = (row: DataObject): string =>
        normalize(row[CONST_TITLES.ONE_C_NOMENCLATURE]);

    const getClientKey = (): string =>
        normalize(
            getClientsDemand()?.[CONST_TITLES.CONTRAGENT],
        );

    const getTestKey = (row: DataObject): string =>
        JSON.stringify([
            getClientKey(),
            getNomenclature(row),
        ]);

    const getTests = (row: DataObject): number | null =>
        tests.value[getTestKey(row)] ?? null;

    const addTest = async (
        row: DataObject,
        date: number,
    ): Promise<void> => {
        const clientKey = getClientKey();
        const nomenclatureKey = getNomenclature(row);

        if (!clientKey || !nomenclatureKey) return;

        if (!Number.isFinite(date)) {
            console.warn("Не удалось добавить тест: некорректная дата");
            return;
        }

        try {
            await updateTest(
                clientKey,
                nomenclatureKey,
                date,
            );
        } catch (error) {
            console.error(
                "Не удалось сохранить дату теста в Supabase:",
                error,
            );
        }
    };

    const removeTest = async (row: DataObject): Promise<void> => {
        const clientKey = getClientKey();
        const nomenclatureKey = getNomenclature(row);

        if (!clientKey || !nomenclatureKey) return;

        try {
            await deleteTest(
                clientKey,
                nomenclatureKey,
            );
        } catch (error) {
            console.error(
                "Не удалось удалить дату теста из Supabase:",
                error,
            );
        }
    };

    return {
        tests,
        getTests,
        addTest,
        removeTest,
    };
};
