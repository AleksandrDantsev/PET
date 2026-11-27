
import type { DataObject } from "@/types/TableSheetData";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import { normalize } from "@/utils/normalize";
import { useUserData } from "@/stores/userDataStore";
import type {
    TestRecord,
    TestUpdate,
} from "@/services/supabase/userDataService";

export const useTableTests = (
    getClientsDemand: () => DataObject | null,
) => {
    const {
        tests,
        addTest: createTest,
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

    const getTests = (row: DataObject): TestRecord[] =>
        tests.value[getTestKey(row)] ?? [];

    const addTest = async (
        row: DataObject,
        testedAt: number,
        comment: string,
        isSuitable: boolean,
    ): Promise<void> => {
        const contragentKey = getClientKey();
        const nomenclatureKey = getNomenclature(row);

        if (!contragentKey || !nomenclatureKey) return;

        if (!Number.isFinite(testedAt) || testedAt < 0) {
            throw new Error("Некорректная дата тестирования");
        }

        await createTest(
            contragentKey,
            nomenclatureKey,
            testedAt,
            comment,
            isSuitable,
        );
    };

    const editTest = async (
        id: string,
        updates: TestUpdate,
    ): Promise<void> => {
        await updateTest(id, updates);
    };

    const removeTest = async (id: string): Promise<void> => {
        if (!id) return;

        await deleteTest(id);
    };

    return {
        tests,
        getTests,
        addTest,
        editTest,
        removeTest,
    };
};
